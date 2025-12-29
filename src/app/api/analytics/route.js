import { NextResponse } from "next/server";

// In-memory storage (in production, use a database)
let analyticsData = null;

export async function POST(request) {
  try {
    const body = await request.json();

    // Store the analytics data
    analyticsData = {
      ...body,
      receivedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Analytics data received",
        timestamp: analyticsData.receivedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error receiving analytics data:", error);
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

    // If no data stored yet, return null
    if (!analyticsData) {
      return NextResponse.json(
        { data: null, message: "No analytics data available yet" },
        { status: 200 }
      );
    }

    // Filter data by date range if provided
    let filteredData = analyticsData;

    if (startDate && endDate && analyticsData.events) {
      filteredData = {
        ...analyticsData,
        events: analyticsData.events.filter((event) => {
          const eventDate = new Date(event.timestamp || event.date);
          return (
            eventDate >= new Date(startDate) && eventDate <= new Date(endDate)
          );
        }),
      };
    }

    return NextResponse.json({ data: filteredData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
