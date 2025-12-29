// Shared analytics storage
// In production, replace with a database

let analyticsEvents = [];

export function storeAnalyticsEvent(event) {
  analyticsEvents.push({
    ...event,
    receivedAt: new Date().toISOString(),
    timestamp: event.timestamp || event.data?.timestamp || new Date().toISOString(),
  });
  
  // Keep only last 10000 events to prevent memory issues
  if (analyticsEvents.length > 10000) {
    analyticsEvents = analyticsEvents.slice(-10000);
  }
}

export function getAnalyticsEvents() {
  return analyticsEvents;
}

export function clearAnalyticsEvents() {
  analyticsEvents = [];
}

