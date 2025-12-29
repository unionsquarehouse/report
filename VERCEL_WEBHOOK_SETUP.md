# Vercel Web Analytics Webhook Setup

## Environment Variables Setup

Create a `.env.local` file in the root of your project with the following:

```env
# Your application base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, update to your Vercel deployment URL:
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Optional: Webhook secret for authentication
WEBHOOK_SECRET=

# Optional: Vercel Analytics API key
VERCEL_ANALYTICS_API_KEY=
```

## Webhook URL Configuration

The webhook URL is automatically constructed from your `NEXT_PUBLIC_APP_URL` environment variable:

### Development URL:
```
http://localhost:3000/api/analytics/webhook
```

### Production URL (after deployment):
```
https://your-domain.vercel.app/api/analytics/webhook
```

You can check your configured webhook URL by visiting:
```
GET /api/analytics/webhook
```

This will return the full webhook URL you need to configure in Vercel.

## How to Configure in Vercel

1. **Go to your Vercel Dashboard**

   - Navigate to your project
   - Go to Settings → Analytics

2. **Set up Web Analytics Drain**

   - In the Analytics settings, look for "Webhook" or "Drain" configuration
   - Add the webhook URL: `https://your-domain.com/api/analytics/webhook`
   - Save the configuration

3. **Alternative: Using Vercel Analytics API**
   - If using Vercel Analytics API directly, you can fetch data using:
   - Endpoint: `/api/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

## API Endpoints

### POST `/api/analytics/webhook`

Receives webhook data from Vercel Web Analytics.

**Request Body:**

```json
{
  "type": "pageview",
  "data": {
    "path": "/",
    "referrer": "https://google.com",
    "country": "US",
    "device": "desktop",
    ...
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook received successfully",
  "receivedAt": "2025-01-15T10:30:00.000Z"
}
```

### GET `/api/analytics`

Fetches stored analytics data (optional date filtering).

**Query Parameters:**

- `startDate` (optional): Filter start date (YYYY-MM-DD)
- `endDate` (optional): Filter end date (YYYY-MM-DD)

**Response:**

```json
{
  "data": {
    "events": [...],
    "metrics": {...},
    ...
  }
}
```

## Testing the Webhook

You can test the webhook endpoint using curl:

```bash
curl -X POST https://your-domain.com/api/analytics/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pageview",
    "data": {
      "path": "/",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  }'
```

## Next Steps

1. Deploy your application to Vercel
2. Configure the webhook URL in Vercel Analytics settings
3. The dashboard will automatically receive and display analytics data
4. Update the frontend to fetch data from `/api/analytics` endpoint

## Note

Currently, the webhook stores data in memory. For production use, you should:

- Use a database (PostgreSQL, MongoDB, etc.)
- Implement proper data aggregation
- Add authentication/authorization
- Set up rate limiting
