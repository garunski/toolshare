import { createClient } from "@/common/supabase/client";

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
  static trackEvent(
    eventType: string,
    properties: Record<string, any> = {},
    userId?: string,
  ): void {
    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: userId,
      session_id: this.sessionId,
      properties: {
        ...properties,
        url: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
      timestamp: new Date().toISOString(),
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
    this.trackEvent(
      "page_view",
      {
        page_name: pageName,
        page_title: typeof document !== "undefined" ? document.title : "",
      },
      userId,
    );
  }

  /**
   * Track item interaction
   */
  static trackItemInteraction(
    action: string,
    itemId: string,
    userId?: string,
  ): void {
    this.trackEvent(
      "item_interaction",
      {
        action,
        item_id: itemId,
      },
      userId,
    );
  }

  /**
   * Track search behavior
   */
  static trackSearch(
    query: string,
    resultsCount: number,
    filters: Record<string, any>,
    userId?: string,
  ): void {
    this.trackEvent(
      "search",
      {
        query,
        results_count: resultsCount,
        filters,
      },
      userId,
    );
  }

  /**
   * Flush events to database
   */
  static async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const supabase = createClient();
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from("analytics_events")
        .insert(eventsToFlush);

      if (error) {
        console.error("Failed to flush analytics events:", error);
        // Re-queue failed events
        this.eventQueue.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error("Error flushing analytics events:", error);
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Initialize analytics tracking
   */
  static initialize(): void {
    // Flush events on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flushEvents();
      });

      // Flush events periodically
      setInterval(() => {
        this.flushEvents();
      }, 30000); // Every 30 seconds
    }
  }
}
