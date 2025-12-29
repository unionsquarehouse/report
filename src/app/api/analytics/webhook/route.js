import { NextResponse } from "next/server";
import crypto from "crypto";
import { storeAnalyticsEvent } from "../storage";

// Disable body parsing to get raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Get webhook URL from environment variables
const getWebhookUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/api/analytics/webhook`;
};

// Verify Vercel webhook signature
function verifySignature(payload, signature, secret) {
  if (!secret) {
    console.warn(
      "WEBHOOK_SECRET not configured - skipping signature verification"
    );
    return true; // Allow in development if secret is not set
  }

  if (!signature) {
    return false;
  }

  // Vercel uses HMAC SHA1 for webhook signatures
  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  // Vercel sends signature in format: sha1=<hash>
  const receivedHash = signature.replace("sha1=", "");

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedHash)
  );
}

// This endpoint is specifically for Vercel Web Analytics webhook/drain
export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-vercel-signature");
    const secret = process.env.WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (secret && !verifySignature(rawBody, signature, secret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the body after verification
    const body = JSON.parse(rawBody);

    // Log the received data for debugging
    console.log("Vercel Analytics Webhook received:", {
      timestamp: new Date().toISOString(),
      dataType: body.type || "unknown",
      hasData: !!body.data,
      signatureVerified: !!secret,
    });

    // Process different types of analytics data
    // Vercel Web Analytics typically sends events in this format
    const processedData = {
      type: body.type || "analytics",
      timestamp: new Date().toISOString(),
      data: body,
    };

    // Store the event directly
    storeAnalyticsEvent(processedData);

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received successfully",
        receivedAt: processedData.timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  const webhookUrl = getWebhookUrl();
  const hasSecret = !!process.env.WEBHOOK_SECRET;

  return NextResponse.json(
    {
      message: "Vercel Analytics Webhook endpoint",
      endpoint: "/api/analytics/webhook",
      method: "POST",
      webhookUrl: webhookUrl,
      destinationUrl: webhookUrl,
      signatureVerification: {
        enabled: hasSecret,
        status: hasSecret
          ? "Configured"
          : "Not configured - add WEBHOOK_SECRET to .env.local",
      },
      instructions: {
        step1: `Configure this URL in Vercel Web Analytics drain settings: ${webhookUrl}`,
        step2: hasSecret
          ? "Signature verification is enabled"
          : "Add WEBHOOK_SECRET to your .env.local file for signature verification",
        step3:
          "The secret will be provided when you create the webhook in Vercel",
      },
      environment: process.env.NODE_ENV || "development",
    },
    { status: 200 }
  );
}
