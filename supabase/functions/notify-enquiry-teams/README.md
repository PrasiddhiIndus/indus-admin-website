# notify-enquiry-teams

Supabase Edge Function that processes pending rows from `notification_queue` and sends alerts to the correct team.

## What it does

1. Reads pending queue rows (`processed = false`)
2. Sends notification through:
   - Slack webhook (`SLACK_WEBHOOK_URL`) if configured
   - Resend email (`RESEND_API_KEY`) if configured
3. Marks queue row as processed on success
4. Updates `notification_logs` with `sent` or `failed` status

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Optional environment variables

- `NOTIFY_FUNCTION_SECRET` (recommended for securing the endpoint)
- `SLACK_WEBHOOK_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (for example `INDUS Enquiries <noreply@yourdomain.com>`)
- `DEFAULT_TEAM_EMAIL` (fallback if row has no `team_email`)

## Local run

```bash
supabase functions serve notify-enquiry-teams --env-file .env.local
```

Call:

```bash
curl -X POST "http://127.0.0.1:54321/functions/v1/notify-enquiry-teams?limit=20" \
  -H "Content-Type: application/json" \
  -H "x-notify-secret: YOUR_SECRET"
```

## Deploy

```bash
supabase functions deploy notify-enquiry-teams
```

Set function secrets:

```bash
supabase secrets set \
  NOTIFY_FUNCTION_SECRET=YOUR_SECRET \
  SLACK_WEBHOOK_URL=YOUR_SLACK_WEBHOOK \
  RESEND_API_KEY=YOUR_RESEND_KEY \
  RESEND_FROM_EMAIL="INDUS Enquiries <noreply@yourdomain.com>" \
  DEFAULT_TEAM_EMAIL="enquiries@indusgroup.com"
```

## Triggering strategy

Use a scheduler/cron (every 1-5 minutes) to call:

`POST /functions/v1/notify-enquiry-teams?limit=20`

Include header:

`x-notify-secret: <NOTIFY_FUNCTION_SECRET>`
