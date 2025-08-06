# Analytics & Reporting System

## Usage Analytics and Business Intelligence

### 1. Analytics Data Collector
- [ ] Create: `src/common/operations/analyticsDataCollector.ts` (under 150 lines)

```typescript
// src/common/operations/analyticsDataCollector.ts
import { createClient } from '@/common/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
}

export class AnalyticsDataCollector {
  private static sessionId: string = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private static eventQueue: AnalyticsEvent[] = [];
  private static readonly BATCH_SIZE = 50;

  /**
   * Track user event
   */
  static trackEvent(eventType: string, properties: Record<string, any> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: userId,
      session_id: this.sessionId,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      },
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(event);

    // Auto-flush when batch size reached
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  static trackPageView(pageName: string, userId?: string): void {
    this.trackEvent('page_view', {
      page_name: pageName,
      page_title: typeof document !== 'undefined' ? document.title : ''
    }, userId);
  }

  /**
   * Track item interaction
   */
  static trackItemInteraction(action: string, itemId: string, userId?: string): void {
    this.trackEvent('item_interaction', {
      action,
      item_id: itemId
    }, userId);
  }

  /**
   * Track search behavior
   */
  static trackSearch(query: string, resultsCount: number, userId?: string): void {
    this.trackEvent('search', {
      query,
      results_count: resultsCount,
      query_length: query.length
    }, userId);
  }

  /**
   * Track loan activity
   */
  static trackLoanActivity(action: string, loanId: string, userId?: string): void {
    this.trackEvent('loan_activity', {
      action,
      loan_id: loanId
    }, userId);
  }

  /**
   * Flush events to database
   */
  static async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Generate usage report
   */
  static async generateUsageReport(startDate: string, endDate: string) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('generate_usage_report', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data;
  }
}
```

### 2. Business Intelligence Dashboard
- [ ] Create: `src/app/admin/analytics/page.tsx` (under 150 lines)

```tsx
// src/app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/primitives/card';
import { Heading } from '@/primitives/heading';
import { Select } from '@/primitives/select';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { AnalyticsChart } from './components/AnalyticsChart';
import { MetricsGrid } from './components/MetricsGrid';
import { AnalyticsDataCollector } from '@/common/operations/analyticsDataCollector';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  searchQueries: number;
  loanRequests: number;
  topCategories: { name: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  itemActivity: { date: string; views: number; requests: number }[];
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const report = await AnalyticsDataCollector.generateUsageReport(
        startDate.toISOString(),
        endDate
      );

      setMetrics(report);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtection>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Heading level={1}>Analytics & Reporting</Heading>
            <p className="text-gray-600 mt-1">
              System usage and performance metrics
            </p>
          </div>

          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <>
            <MetricsGrid metrics={metrics} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnalyticsChart
                title="User Growth"
                data={metrics.userGrowth}
                type="line"
              />
              
              <AnalyticsChart
                title="Item Activity"
                data={metrics.itemActivity}
                type="bar"
              />
            </div>

            <Card className="p-6">
              <Heading level={3} className="mb-4">Top Categories</Heading>
              <div className="space-y-3">
                {metrics.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {index + 1}. {category.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {category.count} items
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No analytics data available</p>
          </Card>
        )}
      </div>
    </AdminProtection>
  );
}
```

### 3. Implementation Checklist
- [ ] Analytics data collector with event tracking
- [ ] Business intelligence dashboard with key metrics
- [ ] Usage reporting and trend analysis
- [ ] Performance metrics and monitoring
- [ ] User behavior analytics
- [ ] Search analytics and optimization insights
- [ ] Revenue and business metrics tracking
- [ ] A/B testing framework
- [ ] Custom report builder
- [ ] Data export functionality
- [ ] Real-time analytics updates
- [ ] Cohort analysis tools
- [ ] Funnel analysis for user journeys
- [ ] Automated reporting and alerts
- [ ] Integration with external analytics platforms 