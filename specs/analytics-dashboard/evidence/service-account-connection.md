# Local service-account connection — 2026-11-03

The user created `caminolegal-web-analytics@camino-legal-analytics.iam.gserviceaccount.com` in project `camino-legal-analytics`, reported adding it as Viewer/Lector to the Camino Legal production property, and downloaded its JSON key. Screenshots show a project-level override of `iam.disableServiceAccountKeyCreation` with effective status `No aplicada`; this changes the original plan's blocked-key path by the user's subsequent administrator action.

Installed the matching service-account JSON in ignored `.env.local`, without printing its contents. Removed `GOOGLE_ANALYTICS_ACCESS_TOKEN` settings from both local environment files so an old token cannot take precedence. Local environment file permissions are owner-only. The downloaded original remains in Downloads pending secure archival by the owner; it was not deleted or copied into tracked files.

Configured production property `541634908`, stream `15069768375`, reporting timezone `America/Mexico_City`.

## Live verification

- Service-account assertion exchanged successfully at `oauth2.googleapis.com`: HTTP **200**. No access token or private key was logged.
- Initial summary request returned HTTP **403**, `PERMISSION_DENIED`, reason **`SERVICE_DISABLED`**.
- After the user enabled the Data API, live re-verification succeeded: summary **`available`** and insights **`available`**, with all **seven** slices non-null. Every provider request returned HTTP **200**, using service-account credentials with no temporary access token.
- Verified production property `541634908`, web stream `15069768375`, timezone `America/Mexico_City`, 28 complete days from `2026-10-06` through `2026-11-02`. The read-only account can query the intended reports. Manual reconciliation against the GA4 UI remains pending.

## Next steps

1. Completed: enable **Google Analytics Data API** in `camino-legal-analytics` and verify both live readers.
2. Reconcile report values with GA4. Restart the local Next.js process to load the new credentials.
3. The separate Google OAuth web client is now configured locally, and Google authorization redirect initiation passes. Complete account sign-in as the allowed reader to verify the callback. The reporting key remains separate from login credentials.
4. Archive the original key securely, remove the Downloads copy after archival, and review restoring the key-creation restriction after required keys are issued. No secret-store archival, key deletion, token revocation, production configuration or deployment was performed.
