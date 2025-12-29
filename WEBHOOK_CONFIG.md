# Vercel Analytics Webhook Configuration

## Quick Setup Guide

### 1. Environment Variables (.env.local)

Create or update `.env.local` with:

```env
# Destination URL base (your deployed app URL)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Signature Verification Secret (from Vercel Dashboard)
WEBHOOK_SECRET=your_secret_from_vercel
```

### 2. Destination URL for Vercel

When configuring the webhook in Vercel Dashboard, use:

```
https://your-domain.vercel.app/api/analytics/webhook
```

Or check your configured URL by visiting:
```
GET https://your-domain.vercel.app/api/analytics/webhook
```

### 3. Getting Your Webhook Secret

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Webhooks** (or **Analytics** → **Drain Settings**)
3. Click **Add Webhook** or **Create Webhook**
4. Enter Destination URL: `https://your-domain.vercel.app/api/analytics/webhook`
5. Vercel will display a **Secret** - copy this
6. Add to `.env.local` as `WEBHOOK_SECRET`

### 4. Verification

The webhook endpoint will:
- ✅ Verify the signature using HMAC SHA1
- ✅ Reject requests with invalid signatures (401 error)
- ✅ Log all webhook events for debugging
- ✅ Return success response for valid requests

### 5. Testing

Test the endpoint configuration:
```bash
curl https://your-domain.vercel.app/api/analytics/webhook
```

This will show:
- Your configured destination URL
- Signature verification status
- Setup instructions

## Security Notes

- **Never commit** `.env.local` to version control
- The `WEBHOOK_SECRET` is required for production
- Signature verification prevents unauthorized requests
- In development, verification is skipped if secret is not set

## Troubleshooting

**401 Invalid Signature Error:**
- Verify `WEBHOOK_SECRET` matches the secret from Vercel
- Ensure the secret is correctly set in `.env.local`
- Check that Vercel is sending the `x-vercel-signature` header

**Webhook Not Receiving Data:**
- Verify the destination URL is correct
- Check Vercel webhook configuration is active
- Review server logs for incoming requests

