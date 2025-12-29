import { NextResponse } from "next/server";
import { getAnalyticsEvents, storeAnalyticsEvent } from "../storage";

// Aggregate analytics events into dashboard format
function aggregateAnalytics(events, startDate, endDate) {
  if (!events || events.length === 0) {
    return null;
  }

  // Filter by date range if provided
  let filteredEvents = events;
  if (startDate && endDate) {
    // Normalize dates to start and end of day for proper comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.timestamp || event.date || event.receivedAt);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Aggregate metrics
  const totalVisitors = new Set(filteredEvents.map((e) => e.data?.ip || e.data?.sessionId || Math.random())).size;
  const totalPageViews = filteredEvents.length;
  
  // Top pages
  const pageViews = {};
  filteredEvents.forEach((event) => {
    const path = event.data?.path || event.path || "/";
    pageViews[path] = (pageViews[path] || 0) + 1;
  });
  const topPages = Object.entries(pageViews)
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 5);

  // Traffic sources
  const sources = {};
  filteredEvents.forEach((event) => {
    const referrer = event.data?.referrer || event.referrer || "Direct/Others";
    let source = "Direct/Others";
    if (referrer.includes("google")) source = "Google Search";
    else if (referrer.includes("facebook")) source = "Facebook";
    else if (referrer && referrer !== "Direct/Others") source = "Direct/Others";
    sources[source] = (sources[source] || 0) + 1;
  });
  const trafficSources = Object.entries(sources)
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((a, b) => b.visitors - a.visitors);

  // Countries
  const countries = {};
  filteredEvents.forEach((event) => {
    const country = event.data?.country || event.country || "Unknown";
    const countryCode = event.data?.countryCode || event.countryCode || "XX";
    if (!countries[countryCode]) {
      countries[countryCode] = {
        country: country,
        code: countryCode,
        visitors: 0,
        views: 0,
      };
    }
    countries[countryCode].visitors += 1;
    countries[countryCode].views += 1;
  });
  const topCountries = Object.values(countries)
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 5);

  // Devices
  const devices = {};
  filteredEvents.forEach((event) => {
    const device = event.data?.device || event.device || "Desktop";
    devices[device] = (devices[device] || 0) + 1;
  });
  const totalDeviceVisits = Object.values(devices).reduce((a, b) => a + b, 0);
  const deviceBreakdown = Object.entries(devices)
    .map(([name, visitors]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      visitors,
      percentage: ((visitors / totalDeviceVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => b.visitors - a.visitors);

  // Operating systems
  const os = {};
  filteredEvents.forEach((event) => {
    const osName = event.data?.os || event.os || "Unknown";
    os[osName] = (os[osName] || 0) + 1;
  });
  const totalOS = Object.values(os).reduce((a, b) => a + b, 0);
  const operatingSystems = Object.entries(os)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalOS) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    metrics: {
      totalVisitors,
      totalPageViews,
      resumesReceived: 0, // This would come from a separate source
      conversionRate: totalVisitors > 0 ? ((totalPageViews / totalVisitors) * 100).toFixed(1) : 0,
    },
    topPages,
    trafficSources,
    countries: topCountries,
    devices: deviceBreakdown,
    operatingSystems,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Store the event
    const event = {
      ...body,
      receivedAt: new Date().toISOString(),
      timestamp: body.timestamp || body.data?.timestamp || new Date().toISOString(),
    };
    
    storeAnalyticsEvent(event);
    const analyticsEvents = getAnalyticsEvents();

    return NextResponse.json(
      {
        success: true,
        message: "Event stored successfully",
        eventsCount: analyticsEvents.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error storing analytics event:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const analyticsEvents = getAnalyticsEvents();
    
    // Aggregate data with date filtering
    const data = aggregateAnalytics(analyticsEvents, startDate, endDate);

    if (!data) {
      return NextResponse.json(
        {
          data: null,
          message: "No analytics data available yet",
          eventsCount: analyticsEvents.length,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data,
        eventsCount: analyticsEvents.length,
        period: startDate && endDate ? { start: startDate, end: endDate } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

