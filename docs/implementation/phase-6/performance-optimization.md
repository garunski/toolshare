# Performance Optimization System

## Database, Caching, and Asset Optimization

### 1. Query Optimization Service
- [ ] Create: `src/common/operations/queryOptimizationService.ts` (under 150 lines)

```typescript
// src/common/operations/queryOptimizationService.ts
import { createClient } from '@/common/supabase/client';

interface QueryCache {
  key: string;
  data: any;
  expiry: number;
}

export class QueryOptimizationService {
  private static cache: Map<string, QueryCache> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Optimized item search with caching and pagination
   */
  static async searchItems(filters: {
    search?: string;
    categoryId?: number;
    location?: string;
    condition?: string[];
    limit?: number;
    offset?: number;
  }) {
    const supabase = createClient();
    const cacheKey = `items:${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('items')
      .select(`
        id,
        name,
        description,
        condition,
        images,
        location,
        is_available,
        created_at,
        external_category_id,
        external_product_taxonomy:external_category_id (
          category_path
        ),
        profiles:owner_id (
          full_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .eq('is_available', true);

    // Apply filters with optimized queries
    if (filters.search) {
      query = query.textSearch('search_vector', filters.search);
    }

    if (filters.categoryId) {
      query = query.eq('external_category_id', filters.categoryId);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.condition?.length) {
      query = query.in('condition', filters.condition);
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by relevance and recency
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) throw error;

    const result = { data, count, hasMore: (count || 0) > offset + limit };
    this.setCache(cacheKey, result);
    
    return result;
  }

  /**
   * Optimized category hierarchy loading
   */
  static async loadCategoryHierarchy(maxDepth = 3) {
    const supabase = createClient();
    const cacheKey = `categories:hierarchy:${maxDepth}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Load only active categories up to specified depth
    const { data, error } = await supabase
      .from('external_product_taxonomy')
      .select('external_id, category_path, parent_id, level')
      .eq('is_active', true)
      .lte('level', maxDepth)
      .order('level')
      .order('category_path');

    if (error) throw error;

    // Build hierarchy tree for efficient rendering
    const hierarchy = this.buildCategoryTree(data);
    this.setCache(cacheKey, hierarchy, 15 * 60 * 1000); // 15 minutes cache

    return hierarchy;
  }

  /**
   * Batch load user profiles for performance
   */
  static async batchLoadUserProfiles(userIds: string[]) {
    const cacheKey = `profiles:batch:${userIds.sort().join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (error) throw error;

    const profileMap = new Map(data.map(profile => [profile.id, profile]));
    this.setCache(cacheKey, profileMap);

    return profileMap;
  }

  /**
   * Optimized dashboard stats with single query
   */
  static async getDashboardStats(userId?: string) {
    const cacheKey = `dashboard:stats:${userId || 'global'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Use RPC function for efficient stats calculation
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      user_id: userId
    });

    if (error) throw error;

    this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes cache
    return data;
  }

  /**
   * Build category tree from flat data
   */
  private static buildCategoryTree(flatData: any[]): any[] {
    const nodeMap = new Map();
    const roots: any[] = [];

    // Create nodes
    flatData.forEach(item => {
      nodeMap.set(item.external_id, { ...item, children: [] });
    });

    // Build tree
    flatData.forEach(item => {
      const node = nodeMap.get(item.external_id);
      if (item.parent_id && nodeMap.has(item.parent_id)) {
        nodeMap.get(item.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Get from cache if not expired
   */
  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache with TTL
   */
  private static setCache(key: string, data: any, ttl = this.CACHE_TTL): void {
    this.cache.set(key, {
      key,
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Clear specific cache keys
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
```

### 2. Image Optimization Service
- [ ] Create: `src/common/operations/imageOptimizationService.ts` (under 150 lines)

```typescript
// src/common/operations/imageOptimizationService.ts
import { createClient } from '@/common/supabase/client';

interface ImageVariant {
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  width: number;
  height: number;
  quality: number;
}

export class ImageOptimizationService {
  private static readonly variants: ImageVariant[] = [
    { size: 'thumbnail', width: 150, height: 150, quality: 80 },
    { size: 'small', width: 300, height: 300, quality: 85 },
    { size: 'medium', width: 600, height: 600, quality: 90 },
    { size: 'large', width: 1200, height: 1200, quality: 95 },
    { size: 'original', width: 0, height: 0, quality: 100 }
  ];

  /**
   * Upload and optimize image
   */
  static async uploadOptimizedImage(
    file: File,
    bucket: string,
    path: string,
    generateVariants = true
  ): Promise<{ url: string; variants: Record<string, string> }> {
    
    const supabase = createClient();
    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (uploadError) throw uploadError;

    const variants: Record<string, string> = {};
    
    if (generateVariants && this.isImageFile(file)) {
      // Generate optimized variants
      for (const variant of this.variants) {
        if (variant.size === 'original') {
          variants[variant.size] = this.getPublicUrl(bucket, path);
          continue;
        }

        try {
          const optimizedBlob = await this.resizeImage(file, variant);
          const variantPath = `${path.replace(/\.[^/.]+$/, '')}_${variant.size}${this.getFileExtension(file.name)}`;
          
          const { error: variantError } = await supabase.storage
            .from(bucket)
            .upload(variantPath, optimizedBlob, {
              cacheControl: '31536000',
              upsert: false
            });

          if (!variantError) {
            variants[variant.size] = this.getPublicUrl(bucket, variantPath);
          }
        } catch (error) {
          console.error(`Failed to create ${variant.size} variant:`, error);
        }
      }
    }

    return {
      url: this.getPublicUrl(bucket, path),
      variants
    };
  }

  /**
   * Get optimized image URL for specific size
   */
  static getOptimizedImageUrl(
    originalUrl: string,
    size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
  ): string {
    if (!originalUrl) return '';
    
    // Replace original with size variant
    const variantUrl = originalUrl.replace(/(\.[^/.]+)$/, `_${size}$1`);
    
    // Fallback to original if variant doesn't exist
    return variantUrl;
  }

  /**
   * Preload critical images
   */
  static preloadImages(urls: string[]): void {
    urls.forEach(url => {
      if (url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Lazy load image with intersection observer
   */
  static setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Resize image using canvas
   */
  private static async resizeImage(file: File, variant: ImageVariant): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const { width: targetWidth, height: targetHeight } = this.calculateDimensions(
          img.width,
          img.height,
          variant.width,
          variant.height
        );

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw and compress
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          variant.quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = maxWidth;
    let height = maxHeight;
    
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Check if file is an image
   */
  private static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Get file extension
   */
  private static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  /**
   * Get public URL from Supabase storage
   */
  private static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
```

### 3. Component Lazy Loading Hook
- [ ] Create: `src/common/hooks/useLazyLoading.ts` (under 150 lines)

```typescript
// src/common/hooks/useLazyLoading.ts
import { useState, useEffect, useRef } from 'react';

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useLazyLoading(options: LazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return {
    elementRef,
    isIntersecting,
    hasTriggered
  };
}

/**
 * Hook for lazy loading data
 */
export function useLazyData<T>(
  loadData: () => Promise<T>,
  options: LazyLoadOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { elementRef, isIntersecting, hasTriggered } = useLazyLoading(options);

  useEffect(() => {
    if (isIntersecting && !hasTriggered && !loading && !data) {
      setLoading(true);
      setError(null);
      
      loadData()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isIntersecting, hasTriggered, loading, data, loadData]);

  return {
    elementRef,
    data,
    loading,
    error,
    isVisible: isIntersecting
  };
}

/**
 * Hook for infinite scroll loading
 */
export function useInfiniteScroll<T>(
  loadMore: (offset: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { elementRef, isIntersecting } = useLazyLoading({
    rootMargin: '100px',
    triggerOnce: false
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setLoading(true);
      setError(null);
      
      loadMore(data.length)
        .then(result => {
          setData(prev => [...prev, ...result.data]);
          setHasMore(result.hasMore);
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isIntersecting, hasMore, loading, data.length, loadMore]);

  const reset = () => {
    setData(initialData);
    setHasMore(true);
    setError(null);
  };

  return {
    elementRef,
    data,
    loading,
    hasMore,
    error,
    reset
  };
}
```

### 4. Performance Monitoring Service
- [ ] Create: `src/common/operations/performanceMonitoringService.ts` (under 150 lines)

```typescript
// src/common/operations/performanceMonitoringService.ts

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitoringService {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;

  /**
   * Record page load performance
   */
  static recordPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    // Record Core Web Vitals
    this.recordCoreWebVitals(pageName);
    
    // Record navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.addMetric(`${pageName}.loadTime`, navigation.loadEventEnd - navigation.loadEventStart);
      this.addMetric(`${pageName}.domContentLoaded`, navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      this.addMetric(`${pageName}.firstByte`, navigation.responseStart - navigation.requestStart);
    }
  }

  /**
   * Record query performance
   */
  static recordQuery(queryName: string, startTime: number, metadata?: Record<string, any>): void {
    const duration = performance.now() - startTime;
    this.addMetric(`query.${queryName}`, duration, metadata);
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Record component render performance
   */
  static recordRender(componentName: string, renderTime: number): void {
    this.addMetric(`render.${componentName}`, renderTime);
    
    // Log slow renders
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Record user interaction performance
   */
  static recordInteraction(action: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.addMetric(`interaction.${action}`, duration);
  }

  /**
   * Record memory usage
   */
  static recordMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    this.addMetric('memory.used', memory.usedJSHeapSize);
    this.addMetric('memory.total', memory.totalJSHeapSize);
    this.addMetric('memory.limit', memory.jsHeapSizeLimit);
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(timeRange = 300000): { // 5 minutes default
    avg: Record<string, number>;
    p95: Record<string, number>;
    count: Record<string, number>;
  } {
    const cutoff = Date.now() - timeRange;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    const grouped = new Map<string, number[]>();
    
    recentMetrics.forEach(metric => {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, []);
      }
      grouped.get(metric.name)!.push(metric.value);
    });
    
    const avg: Record<string, number> = {};
    const p95: Record<string, number> = {};
    const count: Record<string, number> = {};
    
    grouped.forEach((values, name) => {
      values.sort((a, b) => a - b);
      avg[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      p95[name] = values[Math.floor(values.length * 0.95)] || 0;
      count[name] = values.length;
    });
    
    return { avg, p95, count };
  }

  /**
   * Record Core Web Vitals
   */
  private static recordCoreWebVitals(pageName: string): void {
    // Record FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.addMetric(`${pageName}.fcp`, entry.startTime);
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Record LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.addMetric(`${pageName}.lcp`, lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Record CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.addMetric(`${pageName}.cls`, clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Add metric to collection
   */
  private static addMetric(name: string, value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    });
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Send metrics to analytics service
   */
  static async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;
    
    const summary = this.getPerformanceSummary();
    
    // Send to your analytics service
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}
```

### 5. Implementation Checklist
- [ ] Query optimization service with intelligent caching
- [ ] Image optimization with multiple variants
- [ ] Lazy loading hooks for components and data
- [ ] Performance monitoring and Core Web Vitals tracking
- [ ] Database query performance optimization
- [ ] CDN integration for static assets
- [ ] Memory usage monitoring and optimization
- [ ] Bundle size optimization and code splitting
- [ ] Service worker implementation for caching
- [ ] Critical CSS inlining
- [ ] Resource preloading strategies
- [ ] Database connection pooling
- [ ] API response compression
- [ ] Browser caching optimization
- [ ] Real-time performance alerting 