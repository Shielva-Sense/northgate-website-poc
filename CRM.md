# Pointing the site at a CRM

Every enquiry — the two-field call-back form in the hero and the full booking
form — is POSTed to `/api/enquiry`. That route validates it again server-side,
rate limits it, and forwards it to whatever you configure here.

## Configuration

All of these are environment variables. None of them belong in the repo.

| Variable | Required | What it does |
|---|---|---|
| `ENQUIRY_WEBHOOK_URL` | yes, to deliver anything | Where enquiries are POSTed as JSON |
| `ENQUIRY_FALLBACK_URL` | strongly recommended | Second destination, tried only if the first fails |
| `ENQUIRY_WEBHOOK_TOKEN` | if the CRM needs a key | Sent as `Authorization: Bearer <token>` |
| `ENQUIRY_WEBHOOK_AUTH_HEADER` | rarely | Use a different header name instead of `Authorization` |

**With none of these set the site still works**, but nothing is delivered: the
route returns `202 {"delivered": false}` and logs a warning. It never tells a
patient their enquiry arrived when it did not.

## What gets sent

```json
{
  "fullName": "...",
  "phone": "...",
  "email": "...",
  "service": "...",
  "clinician": "...",
  "window": "...",
  "urgency": "...",
  "notes": "...",
  "consent": true,
  "reference": "F3BF6521",
  "receivedAt": "2026-09-25T18:00:00.000Z"
}
```

`reference` is also returned to the patient, so "I submitted something on
Tuesday" is traceable. `notes` may contain health information — see below.

## Delivery guarantees, and their limits

- **Retries**: 3 attempts with backoff, on 5xx and network faults only. A 4xx is
  the CRM saying the request is wrong; retrying cannot fix that, so it does not.
- **Fallback**: if the primary fails every attempt, `ENQUIRY_FALLBACK_URL` is
  tried. Point it at something with a different failure mode to the primary — a
  Zapier catch hook, or an email-to-webhook — not a second endpoint on the same
  box, or one outage takes both.
- **If everything fails**: the patient gets a 502 telling them to ring, with the
  reference. The enquiry is **lost**, and a `NOT DELIVERED` line is logged.

> **This is not a queue.** There is no disk buffer and no replay. If you need
> at-least-once delivery, put a real queue in front of the CRM. The fallback
> narrows the window; it does not close it. Watch the logs for `NOT DELIVERED`.

## GoHighLevel

1. In the workflow builder add an **Inbound Webhook** trigger and copy its URL.
2. Set `ENQUIRY_WEBHOOK_URL` to it. GHL's inbound webhooks are unauthenticated
   by URL secrecy, so leave `ENQUIRY_WEBHOOK_TOKEN` unset.
3. Map `fullName`, `phone`, `email` to the contact; put `service`, `window`,
   `urgency`, `reference` in custom fields; `notes` into a note, not a field.
4. Add a Create Opportunity step if you want it in a pipeline.

## Zapier / Make / n8n

Use a Catch Hook (Zapier), a Custom Webhook (Make) or a Webhook node (n8n) and
paste the URL in. All three accept this payload as-is.

## Before you go live

- **`notes` is special category data** under UK GDPR — it is a patient
  describing symptoms. Check your CRM is a lawful place to put it, that there is
  a data processing agreement with the vendor, and that retention is configured.
  The privacy notice at `/privacy` must name the CRM vendor as a processor.
- Send a test enquiry and confirm it lands **before** the site takes traffic.
- Set `ENQUIRY_FALLBACK_URL`. It is the difference between a slow CRM costing
  you nothing and costing you a patient.
