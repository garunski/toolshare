# Enterprise Features

## Multi-Tenancy, API Limits, and Advanced Security

### 1. Multi-Tenant Architecture
- [ ] Create: `src/common/operations/multiTenantManager.ts` (under 150 lines)

```typescript
// src/common/operations/multiTenantManager.ts
import { supabase } from '@/common/supabase';

interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  features: string[];
  limits: {
    maxUsers: number;
    maxItems: number;
    maxStorage: number; // in MB
  };
  customization: {
    logo?: string;
    primaryColor?: string;
    customDomain?: string;
  };
}

export class MultiTenantManager {
  
  /**
   * Get tenant configuration
   */
  static async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    const { data, error } = await supabase
      .from('tenant_configs')
      .select('*')
      .eq('id', tenantId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      features: data.features || [],
      limits: data.limits || { maxUsers: 100, maxItems: 1000, maxStorage: 1000 },
      customization: data.customization || {}
    };
  }

  /**
   * Check if tenant can perform action
   */
  static async checkTenantLimits(tenantId: string, action: 'add_user' | 'add_item' | 'upload_file', size?: number): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number;
  }> {
    const config = await this.getTenantConfig(tenantId);
    if (!config) {
      return { allowed: false, reason: 'Tenant not found', current: 0, limit: 0 };
    }

    switch (action) {
      case 'add_user':
        const { count: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId);

        return {
          allowed: (userCount || 0) < config.limits.maxUsers,
          current: userCount || 0,
          limit: config.limits.maxUsers,
          reason: (userCount || 0) >= config.limits.maxUsers ? 'User limit exceeded' : undefined
        };

      case 'add_item':
        const { count: itemCount } = await supabase
          .from('items')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId);

        return {
          allowed: (itemCount || 0) < config.limits.maxItems,
          current: itemCount || 0,
          limit: config.limits.maxItems,
          reason: (itemCount || 0) >= config.limits.maxItems ? 'Item limit exceeded' : undefined
        };

      case 'upload_file':
        // Calculate current storage usage
        const storageUsage = await this.calculateStorageUsage(tenantId);
        const fileSize = size || 0;
        const newTotal = storageUsage + (fileSize / 1024 / 1024); // Convert to MB

        return {
          allowed: newTotal <= config.limits.maxStorage,
          current: Math.round(storageUsage),
          limit: config.limits.maxStorage,
          reason: newTotal > config.limits.maxStorage ? 'Storage limit exceeded' : undefined
        };

      default:
        return { allowed: true, current: 0, limit: 0 };
    }
  }

  /**
   * Calculate storage usage for tenant
   */
  private static async calculateStorageUsage(tenantId: string): Promise<number> {
    // This would sum up file sizes from Supabase storage
    // For now, return a placeholder calculation
    const { data } = await supabase
      .from('storage_usage')
      .select('total_size')
      .eq('tenant_id', tenantId)
      .single();

    return data?.total_size || 0;
  }

  /**
   * Check feature access
   */
  static tenantHasFeature(config: TenantConfig, feature: string): boolean {
    return config.features.includes(feature);
  }

  /**
   * Apply tenant context to queries
   */
  static applyTenantFilter(query: any, tenantId: string): any {
    return query.eq('tenant_id', tenantId);
  }
}
```

### 2. API Rate Limiting Service
- [ ] Create: `src/common/operations/rateLimitingService.ts` (under 150 lines)

```typescript
// src/common/operations/rateLimitingService.ts
import { supabase } from '@/common/supabase';

interface RateLimit {
  key: string;
  requests: number;
  windowStart: number;
  windowMs: number;
}

export class RateLimitingService {
  private static limits: Map<string, RateLimit> = new Map();
  
  // Rate limit configurations
  private static readonly configs = {
    'api:search': { requests: 100, windowMs: 60000 }, // 100 per minute
    'api:upload': { requests: 10, windowMs: 60000 }, // 10 per minute
    'api:create': { requests: 20, windowMs: 60000 }, // 20 per minute
    'api:auth': { requests: 5, windowMs: 60000 }, // 5 per minute
  };

  /**
   * Check if request is within rate limits
   */
  static async checkRateLimit(
    limitType: string,
    identifier: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = `${limitType}:${identifier}`;
    const config = this.configs[limitType];
    
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const now = Date.now();
    let limit = this.limits.get(key);

    // Initialize or reset window if expired
    if (!limit || now - limit.windowStart >= limit.windowMs) {
      limit = {
        key,
        requests: 0,
        windowStart: now,
        windowMs: config.windowMs
      };
    }

    // Check if within limits
    if (limit.requests >= config.requests) {
      const retryAfter = Math.ceil((limit.windowStart + limit.windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: limit.windowStart + limit.windowMs,
        retryAfter
      };
    }

    // Increment request count
    limit.requests++;
    this.limits.set(key, limit);

    // Store in database for persistence across instances
    await this.persistRateLimit(key, limit);

    return {
      allowed: true,
      remaining: config.requests - limit.requests,
      resetTime: limit.windowStart + limit.windowMs
    };
  }

  /**
   * Persist rate limit to database
   */
  private static async persistRateLimit(key: string, limit: RateLimit): Promise<void> {
    try {
      await supabase
        .from('rate_limits')
        .upsert({
          key,
          requests: limit.requests,
          window_start: new Date(limit.windowStart).toISOString(),
          window_ms: limit.windowMs,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to persist rate limit:', error);
    }
  }

  /**
   * Get rate limit status for user
   */
  static async getRateLimitStatus(userId: string): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [limitType] of Object.entries(this.configs)) {
      const result = await this.checkRateLimit(limitType, userId);
      status[limitType] = result;
    }

    return status;
  }

  /**
   * Clear rate limits for user (admin function)
   */
  static async clearUserLimits(userId: string): Promise<void> {
    // Remove from memory
    for (const [key] of this.limits) {
      if (key.includes(userId)) {
        this.limits.delete(key);
      }
    }

    // Remove from database
    await supabase
      .from('rate_limits')
      .delete()
      .like('key', `%:${userId}`);
  }
}
```

### 3. Advanced Security Manager
- [ ] Create: `src/common/operations/securityManager.ts` (under 150 lines)

```typescript
// src/common/operations/securityManager.ts
import { supabase } from '@/common/supabase';

export class SecurityManager {
  
  /**
   * Validate and sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  /**
   * Check for suspicious activity patterns
   */
  static async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for rapid successive requests
    const { data: recentActivity } = await supabase
      .from('audit_log')
      .select('created_at, action')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('created_at', { ascending: false });

    if (recentActivity && recentActivity.length > 20) {
      reasons.push('High request frequency detected');
      riskScore += 30;
    }

    // Check for failed login attempts
    const { data: failedLogins } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('created_at', { ascending: false });

    if (failedLogins && failedLogins.length > 3) {
      reasons.push('Multiple failed login attempts');
      riskScore += 40;
    }

    // Check for unusual IP addresses
    const { data: ipHistory } = await supabase
      .from('user_sessions')
      .select('ip_address')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const uniqueIPs = new Set(ipHistory?.map(session => session.ip_address));
    if (uniqueIPs.size > 5) {
      reasons.push('Multiple IP addresses in short period');
      riskScore += 20;
    }

    return {
      isSuspicious: riskScore > 50,
      reasons,
      riskScore
    };
  }

  /**
   * Apply security headers to response
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    event: 'suspicious_activity' | 'access_denied' | 'data_breach' | 'unauthorized_access',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await supabase
      .from('security_log')
      .insert({
        event_type: event,
        user_id: userId,
        metadata,
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
        created_at: new Date().toISOString()
      });
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('security_log')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by event type
    const eventCounts = (data || []).reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: data?.length || 0,
      eventCounts,
      events: data || []
    };
  }
}
```

### 4. Implementation Checklist
- [ ] Multi-tenant architecture with tenant isolation
- [ ] API rate limiting with configurable thresholds
- [ ] Advanced security monitoring and threat detection
- [ ] Tenant-specific feature flags and customization
- [ ] Usage limits and quota management
- [ ] Security event logging and alerting
- [ ] Data isolation between tenants
- [ ] Custom branding and white-labeling
- [ ] Billing and subscription management
- [ ] Admin tenant management interface
- [ ] Tenant analytics and reporting
- [ ] Service level agreement monitoring
- [ ] Backup and disaster recovery per tenant
- [ ] Integration with enterprise SSO providers
- [ ] Advanced audit trails and compliance reporting 