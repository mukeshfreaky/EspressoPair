export type AnalyticsEvent = 
  | 'homepage_view'
  | 'quiz_started'
  | 'quiz_completed'
  | 'recommendation_viewed'
  | 'alternative_clicked'
  | 'retailer_clicked'
  | 'share_clicked'
  | 'product_viewed';

interface EventPayload {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, payload?: EventPayload) {
  // In development, log to console. In production, plugs into Plausible/Umami/Cloudflare
  const timestamp = new Date().toISOString();
  console.log(`📊 [Analytics] ${event}`, { timestamp, ...payload });

  // Plausible / window.plausible hook if available
  if (typeof window !== 'undefined' && (window as unknown as { plausible?: (name: string, opts?: unknown) => void }).plausible) {
    (window as unknown as { plausible: (name: string, opts?: unknown) => void }).plausible(event, { props: payload });
  }
}

