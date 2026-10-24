# Analytics dashboard setup and handoff

Last updated: 2026-10-24. Resume here when continuing the Google read-credential setup.

## Current status

- Implemented dashboard: `/admin/analitica`, including visitors, page views, bounce rate and sessions, with 7/28/90-day and custom ranges.
- User reports having `META_ACCESS_TOKEN`, `NEXT_PUBLIC_META_PIXEL_ID` and `NEXT_PUBLIC_GA4_ID`. Their values and access have not been verified during this setup.
- Confirmed from the user's GA4 screenshot: reporting timezone is Mexico City Time. Use `GOOGLE_ANALYTICS_TIME_ZONE=America/Mexico_City`, replacing the earlier illustrative `America/Merida` example. Leave the GA4 setting unchanged.
- Numeric property and stream IDs have not been recorded here. Obtaining them was explained; completion is unconfirmed.
- Service-account creation, JSON key download and GA4 Viewer access are still unconfirmed. This is the next setup step.
- Last local endpoint check returned `not_connected`. Native tests and synthetic HTTP simulations passed; live Google figures remain unverified.
- Meta's automated reader remains unfinished. A Meta token alone does not activate it. Current coverage is inventory and event mappings.

## 1. Collect the Google resource identifiers

In [Google Analytics](https://analytics.google.com/), select Camino Legal's property.

1. Open **Admin → Property → Property details**. Copy the numeric **Property ID** into `GOOGLE_ANALYTICS_PROPERTY_ID`.
2. Open **Admin → Data collection and modification → Data streams** and select the website's web stream.
3. Copy its numeric **Stream ID** into `GOOGLE_ANALYTICS_STREAM_ID`.
4. Confirm that the stream's **Measurement ID** matches the existing `NEXT_PUBLIC_GA4_ID` (`G-…`). Neither the account ID nor the measurement ID substitutes for the numeric property or stream ID.

References: [Property ID](https://developers.google.com/analytics/devguides/reporting/data/v1/property-id), [Stream ID](https://support.google.com/analytics/answer/12332343?hl=en).

## 2. Create Google read credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/). Select an existing appropriate project or create one for Camino Legal.
2. Open **APIs & Services → Library**. Find **Google Analytics Data API** and enable it.
3. Open **IAM & Admin → Service Accounts → Create service account**.
4. Name it `camino-analytics-reader`, click **Create and continue**, leave optional project permissions empty, and finish. GA4 access is granted separately below.
5. Open the created service account, then **Keys → Add key → Create new key → JSON → Create**. Save the downloaded JSON securely. If organization policy disables key creation, record that constraint and revisit authentication rather than changing organization policy.
6. Copy the service account email ending in `iam.gserviceaccount.com`.
7. In Google Analytics, select Camino Legal's property and open **Admin → Property access management → + → Add users**.
8. Add the service account email with the **Viewer** role. This requires someone with permission to manage property access.

References: [Google Analytics API setup](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart), [Create service-account keys](https://docs.cloud.google.com/iam/docs/keys-create-delete).

## 3. Configure the app

Keep the existing tracking variables. Add the following to the local server environment (for example, an ignored `.env.local` in the project root), replacing placeholders:

```dotenv
GOOGLE_ANALYTICS_PROPERTY_ID=YOUR_NUMERIC_PROPERTY_ID
GOOGLE_ANALYTICS_STREAM_ID=YOUR_NUMERIC_WEB_STREAM_ID
GOOGLE_ANALYTICS_TIME_ZONE=America/Mexico_City
GOOGLE_ANALYTICS_CREDENTIALS_JSON='YOUR_COMPLETE_SERVICE_ACCOUNT_JSON'
```

`GOOGLE_ANALYTICS_CREDENTIALS_JSON` contains the entire downloaded JSON, not the file path. Use valid JSON on one line, preserving the escaped `\n` sequences in `private_key`. Do not paste the key into chat, source files, documentation or Git. Credentials must never use a `NEXT_PUBLIC_` prefix. Configure the same server-only values in the hosting platform when deployment is separately authorized.

The reader also supports `GOOGLE_ANALYTICS_ACCESS_TOKEN`, but it is unnecessary with service-account JSON. It takes precedence if both are set, so avoid leaving an old access token configured alongside the service account.

Restart the application after saving environment changes.

## 4. Verify when resuming

- [ ] Confirm property ID, matching web stream ID and Mexico City timezone are configured.
- [ ] Confirm Google Analytics Data API is enabled in the service account's project.
- [ ] Confirm the JSON is configured server-side and the service account has GA4 Viewer access.
- [ ] Restart the app; open `/admin/analitica` on its actual local port (previous preview used 3014).
- [ ] Read `/api/admin/analytics/summary?days=28` and inspect the structured state without logging credentials.
- [ ] Verify visitors, page views, sessions and bounce rate against the same Google property, web stream and complete-day range. The dashboard uses `totalUsers`, `screenPageViews`, `sessions` and `bounceRate`.
- [ ] Record the result and any remaining limitations in the evidence directory. Do not treat missing results as zero.

Allow for the 15-minute resource cooldown after a provider request, including failures. A different date range may be deferred during this interval. Google processing delay is separate from this refresh interval. Current cooldown/cache enforcement is process-local; production shared enforcement remains open.

If disconnected, check required variable names, numeric IDs and JSON configuration. If access is denied, check API enablement and the exact service-account email's permission on the selected GA4 property. Record safe error states rather than raw credential/provider payloads.

## Scope and continuation

The user deferred application authentication. Advertising is later scope. The approved 90-day limit applies to each query range, and the 30-day verification reminder concerns configuration evidence, not stopping reports or tracking.

The KPI slice is implemented; full discovery, comparisons, reporting breakdowns, production runtime verification, interactive acceptance and live console reconciliation are still open. See [task list](tasks.md) and [summary contract and test evidence](evidence/summary-contract.md). No deployment or provider mutation was performed as part of this handoff.
