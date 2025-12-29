import { NextResponse } from 'next/server';

// Get webhook URL from environment variables
const getWebhookUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/api/analytics/webhook`;
};

// This endpoint is specifically for Vercel Web Analytics webhook/drain
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log the received data for debugging
    console.log('Vercel Analytics Webhook received:', {
      timestamp: new Date().toISOString(),
      dataType: body.type || 'unknown',
      hasData: !!body.data,
    });

    // Process different types of analytics data
    // Vercel Web Analytics typically sends events in this format
    const processedData = {
      type: body.type || 'analytics',
      timestamp: new Date().toISOString(),
      data: body,
    };

    // Here you would typically:
    // 1. Store in a database
    // 2. Process and aggregate the data
    // 3. Update your analytics storage

    // For now, we'll just acknowledge receipt
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook received successfully',
        receivedAt: processedData.timestamp 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  const webhookUrl = getWebhookUrl();
  
  return NextResponse.json(
    { 
      message: 'Vercel Analytics Webhook endpoint',
      endpoint: '/api/analytics/webhook',
      method: 'POST',
      webhookUrl: webhookUrl,
      instructions: `Configure this URL in Vercel Web Analytics drain settings: ${webhookUrl}`,
      environment: process.env.NODE_ENV || 'development'
    },
    { status: 200 }
  );
}

