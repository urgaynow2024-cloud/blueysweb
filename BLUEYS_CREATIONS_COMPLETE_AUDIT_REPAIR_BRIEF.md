# BLUEY'S CREATIONS WEBSITE — COMPLETE AUDIT, REPAIR & REGRESSION PREVENTION

**Priority: CRITICAL — Restore Owner access and fix existing regressions before adding features or redesigning anything.**

Website: `https://www.blueycomissions.website/`

Repository: Inspect the currently opened repository and its actual configuration before making changes.

Existing audit: `WEBSITE_AUDIT.md`, if present.

## IMPORTANT RULES

The website has experienced repeated regressions. Previous tasks have been marked complete even though problems remained visible.

1. Inspect the current implementation and recent Git history before changing code.
2. Identify the root cause of each issue before applying a fix.
3. Preserve the existing website design, icons, animations, content, database records, and working functionality.
4. Do not replace existing designs with generic layouts, random images, gradients, or temporary placeholders.
5. Do not remove security checks to make an error disappear.
6. Do not run destructive database commands, production migrations, bulk updates, or data deletion without a clear need and explicit approval.
7. Never expose passwords, session tokens, Supabase service-role keys, Stripe secrets, or other credentials.
8. Never claim a task is fixed without relevant verification.
9. If a tool call fails, inspect its schema and correct the arguments. Do not repeatedly retry malformed calls or claim changes were made when they were not.
10. Make small, focused changes, test them, and inspect the results before continuing.
11. If a production service, dashboard, credential, or browser is unavailable, document exactly what remains unverified.
12. Do not overwrite unrelated user changes or revert unrelated working features.

---

# PHASE 1 — RESTORE OWNER ACCESS

**Highest priority. Fix this before continuing with other changes.**

The Owner admin panel displays **"Owner access required"** on the Moderators page, despite the Owner interface and moderator creation form being visible.

The screenshot does not establish whether the cause is authentication, session state, role checks, API authorisation, or frontend state.

## Investigate
- Inspect the Owner login and authentication flow.
- Identify the API endpoint used to load moderator management.
- Inspect its server-side permission check.
- Compare the identity and role recognised by the main Owner dashboard with those recognised by the Moderators API.
- Check session refresh, cookies, token validation, role mapping, middleware, and API response handling.
- Check whether the page shows cached or stale content after an API request fails.
- Review recent commits and changes for regressions.
- Determine whether the Owner session has expired or the server genuinely rejects the account.
- Inspect server logs and browser network responses without exposing credentials.

## Fix
- Restore correct access for the legitimate Owner account using the existing intended authentication design.
- Preserve server-side Owner authorisation.
- Do not grant Owner permissions to every admin, moderator, or authenticated user.
- Do not bypass authentication in frontend code.
- Do not delete, recreate, or reset the Owner account as a workaround.
- Do not remove existing permission checks.
- Preserve Owner settings, content, reviews, adoptables, images, and moderator accounts.

## Fix the conflicting UI
- Only show the moderator management form after the server confirms authorisation.
- Show a proper access-denied state when the user is not authorised.
- Handle expired sessions, loading states, and API failures separately.
- Refresh authorisation state correctly on reload.
- Do not confuse a network error with confirmed lack of Owner permissions.

## Required tests
- Owner login and dashboard access.
- Owner access to moderator management.
- Moderator creation and management.
- Access to all existing Owner sections.
- Session refresh and page reload.
- Rejection of Owner-only API requests from moderators.
- Rejection of Owner-only API requests from unauthorised users.

**Completion requirement:** Verify the real server-side permission result and rendered page. A successful build alone is not enough.

---

# PHASE 2 — FIX SUPABASE STORAGE UPLOAD FAILURE

The admin panel reports:

`Upload test failed for "portfolio-images"`

`Upload test failed (HTTP 403)`

The displayed message suggests checking CORS settings, but HTTP 403 does not by itself prove that CORS is the cause.

## Diagnose the actual request
- Locate the upload-test implementation.
- Identify the exact Supabase project and Storage bucket being targeted.
- Inspect the request URL, HTTP method, required headers, authentication state, payload, and response body.
- Inspect browser console errors, network failures, and relevant server logs.
- Determine whether the problem is caused by authentication, Storage policies, bucket configuration, an incorrect request, or CORS/preflight.
- Verify which client and credentials the application uses for uploads.
- Check whether the session is valid when the request is made.
- Never log or expose secret keys or session tokens.

## Verify configuration
- Confirm that `portfolio-images` exists in the intended Supabase project.
- Inspect the Storage policies relevant to the intended upload operation.
- Verify that the correct authenticated role has the necessary permissions.
- Check supported CORS configuration for the actual production domain and any required development origin.
- Verify the supported Supabase configuration path rather than assuming a particular bucket-level CORS setting exists.
- Check that required methods and headers are supported by the actual request.

## Fix safely
- Apply the smallest fix that resolves the confirmed cause.
- Do not make the bucket public merely to bypass a permissions failure.
- Do not expose the service-role key in frontend code.
- Do not disable authentication or remove existing security policies.
- Do not grant unrestricted upload, update, or delete access.
- Preserve existing portfolio images and access rules.

## Required tests
1. Retry the upload test and capture the actual HTTP response.
2. Upload a harmless test image through the same flow as the admin panel.
3. Verify the uploaded image can be retrieved under the intended access rules.
4. Confirm unauthorised uploads remain blocked.
5. Confirm the production domain works.
6. Confirm supported development workflows still work.
7. If dashboard access is unavailable, provide verified instructions for the required manual configuration.

Do not mark the upload issue resolved until a real upload succeeds or the precise remaining external blocker is documented.

---

# PHASE 3 — RESTORE THE MISSING HOMEPAGE HERO IMAGE

The homepage hero image is still missing even after the previous task was marked complete.

The screenshot shows the existing navigation and hero text, the £15 starting-price card, and a decorative horizontal line and rocket icon—but the right-hand hero area is otherwise largely empty.

## Investigate
- Locate the homepage hero component and the exact element intended to display the image.
- Review Git history and recent changes to find when the image disappeared.
- Check whether the image element was removed or is conditionally hidden.
- Check the configured image URL, asset path, database value, admin settings, API response, and actual network request.
- Inspect CSS visibility, dimensions, positioning, responsive breakpoints, stacking contexts, overlays, and animation styles.
- Check whether an unrelated admin save operation clears or overwrites the image configuration.
- Determine whether the original image exists in the repository, previous commits, uploaded assets, or saved site configuration.

## Fix
- Restore the original intended hero image where recoverable.
- Preserve the headline, description, starting-price card, buttons, navigation, decorative icons, and animations.
- Do not substitute random stock photography or generate a replacement without approval.
- Do not hide the problem with a blank element, gradient, or unrelated image.
- Do not make broad CSS changes that affect unrelated pages.
- Ensure the image source persists across reloads.

## Required tests
- Confirm the image request succeeds.
- Confirm the image is actually visible in the rendered homepage.
- Check desktop and mobile layouts.
- Reload the page and verify the image remains visible.
- Verify unrelated admin settings do not clear the image.
- Inspect console and network errors.

If visual browser testing is unavailable, state that clearly and do not claim visual verification.

---

# PHASE 4 — FIX ADOPTABLES EDITOR SAVE AND PERSISTENCE

The Adoptables editor has previously displayed "nothing to save" or failed to enable Save after changes. Changes must persist after reloading.

## Investigate
- Inspect the editor's initial state, current form state, dirty-state detection, validation, and save handler.
- Check text, colour, metadata, image uploads, image URLs, and other editable fields.
- Check whether asynchronous image operations finish before save-state comparison.
- Check whether the frontend compares the correct original and edited values.
- Check the API payload, server validation, database update, and returned response.
- Verify successful saves update the editor's saved baseline.

## Fix
- Make dirty-state detection reliable for all supported fields.
- Enable Save when a valid unsaved change exists.
- Disable Save only when there are genuinely no changes or saving is otherwise invalid.
- Show useful validation and save errors.
- Preserve the current editor UI and existing content.
- Do not report success before the server confirms the save.

## Required tests
- Change text and save.
- Change metadata and save.
- Upload or replace an image and save.
- Reload the page and confirm changes persist.
- Reopen the editor and verify saved data is loaded.
- Confirm unchanged content correctly reports no pending changes.
- Confirm a failed save does not falsely mark content as saved.

---

# PHASE 5 — FIX CLIENT REVIEWS MODERATION

Previous issues include approval not persisting after refresh and the Client Reviews section displaying a full-page "Something went wrong" error.

## Investigate
- Inspect review approval and rejection API endpoints.
- Check authentication and permissions.
- Inspect database queries, field names, validation, and update conditions.
- Check whether optimistic UI updates hide a failed request.
- Inspect error handling and component-level error boundaries.
- Determine why the entire Client Reviews section fails when an error occurs.
- Review relevant server logs and actual API responses.

## Fix
- Make approval and rejection persist correctly.
- Ensure the API returns a reliable success or failure result.
- Confirm changes against a fresh database read.
- Show useful errors when moderation fails.
- Isolate section failures so one bad request does not unnecessarily crash the Owner dashboard.
- Preserve existing reviews and moderation history.
- Do not delete reviews to resolve rendering or approval problems.

## Required tests
- Approve a test review and reload.
- Reject a test review and reload.
- Verify stored status with a fresh read.
- Test API failures and expired sessions.
- Verify the reviews section can recover from an error.
- Confirm other Owner sections remain usable.

---

# PHASE 6 — MODERATOR ADOPTABLES MANAGEMENT PERMISSION

The Owner Moderators panel currently has Review moderation, Submission moderation, and Hide content. Add a separate **Adoptables Management** permission.

When enabled, an authorised moderator should be able to access the existing Adoptables management functionality and create, upload, edit, and publish adoptables as supported by the application.

## Owner panel requirements
- Add a separate Adoptables Management permission alongside existing moderator permissions.
- Let the Owner enable or disable it per moderator.
- Persist the permission and display its actual saved state after reload.
- Preserve existing permission settings and moderator accounts.
- Keep Owner-only configuration, pricing, payments, security, and account management restricted to the Owner.

## Moderator dashboard requirements
- Add an Adoptables section that appears only when the moderator has this permission.
- Reuse the existing Adoptables editor and upload workflow wherever possible.
- Support creating, editing, uploading, saving, and publishing adoptables within the authorised scope.
- Do not duplicate the editor or create an unrelated replacement interface.
- Hide or disable unauthorised actions appropriately.

## Security requirements
- Enforce the permission on the server/API, not only in the frontend.
- Verify the moderator's current saved permission for every protected operation.
- Do not trust a permission value supplied by the browser.
- Deny access when the permission is absent or disabled.
- Do not grant moderators Owner privileges.
- Preserve existing moderation permissions.

## Required tests
1. Owner enables Adoptables Management.
2. Moderator logs in and sees the Adoptables section.
3. Moderator creates and saves a test adoptable.
4. Moderator uploads an image using the intended workflow.
5. Moderator edits and publishes the test adoptable.
6. Changes persist after reload.
7. Owner disables the permission.
8. Moderator can no longer access the protected interface or API operations.
9. Direct API requests without permission are rejected.
10. Existing moderation permissions continue working independently.

---

# PHASE 7 — FIX THE MODERATOR LOGIN ERROR

The moderator login screen previously displayed:

`Admin Access`

`Enter the admin password to continue`

`Server error. Please try again.`

Production logs showed repeated HTTP 401 responses from `POST /api/auth/login` and `GET /api/auth/me`, followed by repeated HTTP 429 responses from the login endpoint.

These logs establish that authentication requests failed and rate limiting subsequently occurred. They do not, by themselves, establish why the initial authentication failed.

## Investigate
- Inspect the login endpoint and moderator authentication flow.
- Determine why initial login requests return 401.
- Check password verification, account lookup, stored password hashes, session creation, cookie settings, environment configuration, and response handling.
- Verify moderator authentication is separate from Owner authentication where intended.
- Inspect the rate limiter and ensure it does not incorrectly block legitimate sessions indefinitely.
- Check whether the UI converts authentication or server errors into a misleading generic message.

## Fix
- Correct the underlying authentication failure.
- Preserve secure password hashing, session management, and rate limiting.
- Do not disable rate limiting as a workaround.
- Do not log plaintext passwords.
- Provide useful, safe error messages without exposing sensitive implementation details.
- Ensure the moderator dashboard loads after successful authentication.

## Required tests
- Valid moderator login.
- Invalid password.
- Unknown account.
- Expired or invalid session.
- Rate-limit behaviour.
- Logout and subsequent login.
- Moderator access restrictions.
- Owner authentication still works independently.

---

# PHASE 8 — NO AI BADGE MANAGEMENT

The website needs a dedicated Owner-managed NO AI badge/banner using the user's own image asset.

Required message:

**NO AI**

"AI-generated artwork and AI-assisted submissions are not accepted."

## Requirements
- Preserve the existing badge image and website design.
- Fix image rendering if it appears too small.
- Provide a dedicated Owner admin section for uploading and replacing the badge image.
- Provide a preview before saving.
- Allow the Owner to enable or disable the badge.
- Provide placement options compatible with the existing design.
- Persist the image, enabled state, and placement.
- Validate uploaded file types and sizes.
- Display the image at the intended dimensions without distortion.
- Do not overwrite the badge image or configuration when unrelated settings are saved.
- Keep existing icons intact.

## Required tests
- Upload and preview an image.
- Save and reload.
- Replace the image and verify persistence.
- Toggle the badge off and on.
- Test supported placements.
- Test desktop and mobile.
- Confirm unrelated admin changes do not reset the badge.

---

# PHASE 9 — PERFORMANCE AND ADMIN PANEL STABILITY

The website, especially the Owner admin panel, has experienced slow loading and inconsistent behaviour. Do not make performance changes based on guesswork.

## Investigate
- Measure actual page load and interaction performance.
- Identify slow API requests, repeated database queries, excessive rendering, large images, unnecessary client-side work, and expensive effects.
- Check whether admin sections load unnecessary data before being opened.
- Inspect image optimisation, caching, pagination, and request duplication.
- Check for errors that trigger repeated retries or repeated API requests.

## Fix
- Prioritise measured bottlenecks.
- Preserve functionality and visual styling.
- Use appropriate image optimisation and caching without serving stale admin data.
- Reduce unnecessary API requests and rendering work.
- Add pagination or bounded queries where appropriate.
- Do not introduce loading animations as a substitute for fixing the cause.
- Do not remove security checks or reduce data integrity to improve speed.

## Required tests
- Measure relevant routes before and after changes where possible.
- Verify the Owner dashboard and major sections remain functional.
- Check network requests and console errors.
- Confirm images and saved settings still load correctly.
- Verify mobile and desktop layouts.

---

# PHASE 10 — FULL ROUTE, SECURITY, AND REGRESSION AUDIT

Inspect the current repository and enumerate the actual routes and features. Do not assume a route or feature exists without checking.

Audit:
- Public homepage and hero image.
- Services, portfolio, adoptables, pricing, About, FAQ, process, and other existing public pages.
- Commission and submission flows.
- Reviews and review moderation.
- Owner login and all Owner dashboard sections.
- Moderator login and dashboard.
- Moderator permissions and protected API endpoints.
- Image uploads and Supabase Storage.
- NO AI badge settings.
- Site settings and persistence.
- Relevant database schema and migrations.
- Input validation and error handling.
- Authentication, authorisation, and rate limiting.
- Broken links, missing assets, and console errors.
- Responsive layouts and existing accessibility behaviour.

Preserve the current design and existing features unless a specific change is required to fix a confirmed defect.

## Data safety
- Identify the configured database before running commands.
- Do not assume a local SQLite file is the production database.
- Do not query or modify production data unnecessarily.
- Do not apply migrations or destructive operations without verifying their impact and obtaining approval when required.
- Use test data and an isolated environment for destructive or persistence tests where possible.
- Never delete real customer records, reviews, adoptables, images, or payment records to make tests pass.

## Security checks
- Keep secrets server-side.
- Enforce permissions in server-side code.
- Validate uploads and API inputs.
- Prevent unauthorised access to Owner and moderator operations.
- Preserve payment and checkout security.
- Avoid leaking sensitive information through errors or logs.

---

# PHASE 11 — TOOL AND IMPLEMENTATION DISCIPLINE

Previous coding attempts encountered invalid tool arguments, including missing required parameters such as `filePath`, `oldString`, `newString`, and `content`.

For every tool operation:
- Inspect the available tool schema and use exact required argument names and types.
- Read the relevant file before editing it.
- Use the supported file editing method available in the current environment.
- Verify the resulting file after each meaningful edit.
- If a tool is unavailable, use an available supported alternative or clearly report the blocker.
- Do not fabricate successful tool results.
- Do not repeat failed tool calls with the same invalid arguments.
- Keep changes focused and review diffs for accidental unrelated modifications.

Do not perform broad rewrites when a targeted fix is sufficient.

---

# PHASE 12 — FINAL VERIFICATION AND REPORT

Update `WEBSITE_AUDIT.md` in the existing repository with the results of this work.

For every issue, document:
1. Original observed behaviour.
2. Confirmed root cause, or state that the cause remains unconfirmed.
3. Files changed.
4. Relevant configuration or database changes.
5. Tests actually executed.
6. Actual test results.
7. Whether browser-based visual verification was performed.
8. Any manual Supabase/dashboard actions still required.
9. Any remaining risks or unresolved problems.

## Final completion checklist
- [ ] Owner can authenticate and use Owner-only sections.
- [ ] Moderators page no longer shows a conflicting access-denied state.
- [ ] Unauthorised users and moderators cannot access Owner-only operations.
- [ ] Supabase Storage upload test succeeds, or the precise external blocker is documented.
- [ ] Homepage hero image is visibly restored.
- [ ] Adoptables edits save and persist after reload.
- [ ] Review approvals and rejections persist after reload.
- [ ] Moderator login works and rate limiting remains secure.
- [ ] Adoptables Management permission is configurable by the Owner.
- [ ] Moderator Adoptables access is enforced server-side.
- [ ] NO AI badge image and settings persist.
- [ ] Performance improvements are based on measured evidence.
- [ ] Existing public pages, admin sections, and data remain intact.
- [ ] Build and relevant tests have been run.
- [ ] `WEBSITE_AUDIT.md` accurately reports what was and was not verified.

## Required final response

Return a concise but complete report listing:
- Issues fixed.
- Confirmed root cause of each issue.
- Files changed.
- Tests executed and their actual outcomes.
- Any production or dashboard steps still needed.
- Any features or fixes that remain incomplete.

**Do not mark the entire project complete if only some phases have been implemented.**

Work in priority order: restore Owner access first, investigate the Storage 403, restore the missing hero image, then fix persistence and moderation issues. Complete the remaining phases only after the higher-priority work is stable.

The objective is to make the existing website reliable again without losing content, weakening security, or introducing new regressions.
