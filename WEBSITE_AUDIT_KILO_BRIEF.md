# Bluey Commissions Website — Full Audit and Repair Request

**Website:** https://www.blueycomissions.website  
**Priority:** Fix production authentication and moderator access first, then repair review/adoptables workflows and complete a broader audit.

Use this document as the task brief for Kilo. Inspect the current repository and recent changes before editing. Fix confirmed problems safely; do not merely document them.

---

## 1. Critical: investigate production authentication failures

The moderator login screen at `/moderator` has displayed:

> Admin Access  
> Enter the admin password to continue.  
> Server error. Please try again.

Production logs from October 9 show:

| Time | Request | Status |
|---|---|---:|
| 15:24:43.62 | `POST /api/auth/login` | 429 |
| 15:24:40.56 | `POST /api/auth/login` | 429 |
| 15:24:39.68 | `GET /api/auth/me` | 401 |
| 15:24:38.50 | `POST /api/auth/login` | 429 |
| 15:23:52.84 | `POST /api/auth/login` | 429 |
| 15:23:50.55 | `GET /api/auth/me` | 401 |
| 15:23:49.25 | `POST /api/auth/login` | 429 |
| 15:23:47.33 | `POST /api/auth/login` | 429 |
| 15:23:43.67 | `GET /api/auth/me` | 401 |
| 15:23:38.90 | `GET /api/auth/me` | 401 |
| 15:23:38.25 | `GET /admin` | 200 |
| 15:23:37.31 | `POST /api/auth/login` | 401 |
| 15:23:33.93 | `POST /api/auth/login` | 401 |
| 15:23:28.99 | `GET /api/auth/me` | 401 |
| 15:23:27.31 | `POST /api/auth/login` | 401 |
| 15:23:23.11 | `POST /api/auth/login` | 401 |
| 15:23:21.11 | `POST /api/auth/login` | 401 |
| 15:23:03.72 | `GET /api/auth/me` | 401 |
| 15:23:49.25 | `GET /admin` | 304 |
| 15:23:43.57 | `GET /admin` | 304 |
| 15:23:39.63 | `GET /admin` | 304 |

The `401` responses happened before the `429` responses. Do not assume rate limiting is the original cause.

### Investigate

- Why `/api/auth/login` returns `401`: account lookup, credential verification, password hashing, account state, and response handling.
- Why requests subsequently return `429`: rate-limiter threshold, window/reset behaviour, storage, key generation, and production proxy/IP handling.
- Whether Owner and moderator authentication share an endpoint, limiter, account lookup, or session system.
- Why `/api/auth/me` returns `401`: session creation and validation, cookie attributes/domain/path, `Secure`/`SameSite`, expiry, and whether the browser sends the cookie.
- Production environment configuration and database connectivity.
- Recent code changes that may have introduced regressions.
- Server-side exceptions and deployment logs.
- Whether the frontend incorrectly displays authentication failures as generic server errors.

### Required fix and safety

- Fix the root cause, not just the error message.
- Valid credentials must work; invalid credentials must remain rejected.
- Successful login must create a valid session that persists through navigation and refresh.
- Show distinct, safe feedback for invalid credentials, rate limits, and genuine server errors.
- Preserve effective rate limiting; do not disable it or bypass authentication.
- Do not reset passwords without authorisation, expose secrets, or grant Owner privileges to moderators.
- Do not repeatedly retry while rate-limited.
- Verify a successful login with a fresh authenticated request to `/api/auth/me`.
- If the failure cannot be reproduced safely outside production, document the evidence and the remaining production verification needed.

---

## 2. Moderator dashboard and permissions

Audit the full moderator journey: login, logout, session persistence, dashboard loading, API access, error states, and permission enforcement.

Existing moderator permission toggles include:

- Review moderation — approve or reject client reviews.
- Submission moderation — approve or reject commission submissions.
- Hide content — hide inappropriate reviews or submissions.

### Add a separate permission: Adoptables Management

Description: **“Create, upload, edit, and manage adoptable listings.”**

When enabled, moderators should be able to:

- Create adoptable listings.
- Upload and replace adoptable images/previews.
- Edit names, descriptions, prices, categories, and other existing listing fields.
- Save and publish listings to the public Adoptables page.
- Edit existing listings and their images.
- Save drafts if the current system supports drafts.

Requirements:

- Add the toggle to the existing Moderators section.
- Enforce it on every relevant server/API operation, not just by hiding interface controls.
- When disabled, a moderator must not be able to create, upload, edit, or publish adoptables, including through direct API requests.
- Reuse the existing editor, database, and secure upload pipeline wherever possible.
- Do not give moderators unrestricted database access.
- Keep Owner-only settings, payments, design/site configuration, moderator management, and other sensitive functions restricted to the Owner.
- Do not break the existing review, submission, or hide-content permissions.

Test with an authorised moderator account in a safe environment: enable the permission, create/upload/publish an adoptable, verify it publicly, disable the permission, then confirm the actions are denied.

---

## 3. Client Reviews: approval does not persist and the section has crashed

The Client Reviews admin section previously showed a pending review. Pressing **Approve** did not persist the change after refreshing; the review remained pending.

The review area also displayed a full-page error:

> Something went wrong. Please try again. If the problem continues, get in touch and let me know.

### Investigate and fix

- Trace the Approve action through its frontend handler, API/server action, database update, and review-fetching logic.
- Verify the correct review ID and status field are updated.
- Check database policies, authentication, permissions, and error handling.
- Check caching/revalidation and stale client state separately from the database write.
- Find the actual runtime error behind the full-page crash using logs and browser console information.
- Make sure a failure in the reviews section cannot crash the entire admin dashboard.
- Show success only after the database confirms the update.
- Show a useful error if the update fails.
- Refresh/revalidate the review list after successful changes.

Test that:
1. The Client Reviews section loads without crashing.
2. Approving a pending review updates the database.
3. A fresh database read and page reload still show it as approved.
4. It appears in the correct public section.
5. Editing, rejecting, and deleting work correctly.
6. Existing reviews, ratings, author information, and content are preserved.

Do not simply turn the button green or optimistically change the UI without confirming persistence. Do not delete reviews or reset production data during testing.

---

## 4. Adoptables editor save-state bug

The Adoptables editor has incorrectly indicated there is “nothing to save” after edits.

Fix the underlying dirty-state/change-detection logic:

- Any actual editable-field change should enable Save.
- Changing a field back to its original value should correctly clear the dirty state.
- Image selections/uploads must be detected as changes.
- Save should send the correct changed values to the existing backend/database.
- After confirmed success, reset the dirty state.
- Show clear success/error feedback.
- Changes must persist after a page reload.
- Preserve existing adoptables and images.

Test changes to more than one field, image replacement, save/reload, and changing a value back to its original value.

---

## 5. NO AI badge: image sizing and admin management

I have my own NO AI badge image. Keep it as a separate asset; never replace, overwrite, or interfere with existing website icons.

The current badge image looks too small inside its banner, with too much empty space around it.

### Display requirements

- Make the image appropriately larger and readable within the existing banner.
- Preserve the image's aspect ratio; do not stretch or distort it.
- Use appropriate responsive sizing and `object-fit` settings.
- Preserve the website's existing rounded corners, colours, typography, and overall design.
- Make the banner responsive on desktop and mobile.
- Do not redesign unrelated components or replace existing icons.

The public message should read:

**NO AI**

AI-generated artwork and AI-assisted submissions are not accepted.

### Admin controls

Provide a dedicated **NO AI Badge** section in the admin panel where the Owner can:

- Upload a new badge image.
- Preview the current image.
- Replace the image later without editing code.
- Enable or disable the banner.
- Choose where the banner appears on the public site.
- Save settings and have them persist after refreshing.

Use the existing secure upload/storage system where appropriate. Validate uploaded files and show clear errors.

Test image replacement, persistence, enable/disable, placement, and desktop/mobile display.

---

## 6. Website performance

The site feels slow overall, especially the admin page. Investigate actual bottlenecks and make evidence-based improvements.

Check:

- Duplicate API/database requests.
- Repeated authentication/session checks.
- Slow or repeated database queries.
- Large images and unoptimised media.
- Images/videos blocking initial rendering.
- Unnecessary client-side rendering and scripts.
- Repeated fetching of the same data.
- Caching and stale data.
- Upload handling.
- Components that load everything before showing the main interface.

Potential improvements, only where appropriate to the existing architecture:

- Render the admin shell promptly and load secondary data progressively.
- Use thumbnails/previews and lazy loading for non-visible media.
- Avoid blocking the initial page on full-resolution images or videos.
- Cache data that is safe to cache and does not need to be fresh on every request.
- Avoid redundant authentication or API calls.

Do not hide the problem with a loading animation, remove functionality, or introduce stale admin data. Verify that changes really save and that permission-sensitive content is not improperly cached.

---

## 7. Audit the public website and all admin sections

Audit accessible routes and relevant source code for:

- Home.
- Services.
- Portfolio.
- Pricing.
- FAQ.
- Process.
- Adoptables.
- Credits.
- About.
- Contact.
- Terms of Service.
- Privacy.
- Links.
- NSFW content controls, where authorised.
- Admin overview.
- Images/uploads.
- Reviews.
- Adoptables.
- Pricing.
- Credits.
- Site information.
- Moderator management.
- NO AI badge management.
- Save indicators and error states.

Check navigation, broken/missing assets, forms, API requests, mobile layout, incorrect/stale content, and persistence.

A page being inaccessible to an inspection tool is not proof it is broken. Verify problems using source code, logs, and appropriate tests. Avoid making unrelated changes just to make every page look different.

---

## 8. Security and production-data safeguards

- Never expose passwords, API keys, database credentials, cookies, session tokens, or secrets in reports.
- Do not bypass authentication or weaken rate limiting to make login appear functional.
- Enforce authorisation server-side on every sensitive operation.
- Validate uploaded files and enforce reasonable size/type limits.
- Preserve existing production data.
- Do not reset the database, run destructive migrations, or delete records during testing.
- Do not make unnecessary production writes.
- Use a safe test environment and test accounts wherever possible.
- If production verification is necessary, explain the exact read/write operation first and avoid destructive changes.

---

## 9. Tests and verification

Run the available automated tests, linting, type checks, and production build.

Test the affected flows safely:

1. Valid Owner login.
2. Invalid credentials are rejected.
3. Rate limiting works and resets as designed.
4. Successful login creates a valid session.
5. `/api/auth/me` recognises that session after refresh.
6. Moderator login and logout work.
7. Moderator permissions are enforced server-side.
8. Adoptables can be created, uploaded, edited, and published by authorised moderators.
9. Disabled adoptables permission blocks those actions.
10. Review approval persists after a fresh read and reload.
11. Review editing, rejection, and deletion work.
12. Client Reviews loads without a full-page crash.
13. NO AI image and settings persist and display correctly.
14. Public pages and existing admin features remain functional.
15. Build, lint, type checks, and relevant automated tests produce recorded results.

Do not claim a test passed unless it was actually executed. Distinguish automated tests, manual tests, and tests blocked by missing access or configuration.

---

## 10. Create `WEBSITE_AUDIT.md`

Create `WEBSITE_AUDIT.md` in the repository root.

Include:

- Executive summary.
- Confirmed bugs and root causes.
- Suspected issues that could not yet be confirmed.
- Severity and priority for each issue.
- Authentication findings, including the observed `401` then `429` sequence and `/api/auth/me` `401` responses.
- Moderator permission findings.
- Review approval and crash fixes.
- Adoptables editor and moderator-upload changes.
- NO AI badge sizing and admin controls.
- Performance findings and improvements.
- Security findings.
- Files changed and why.
- Tests actually executed and their results.
- Issues still unresolved.
- Any required deployment/environment configuration and manual steps.

Include relevant file/function references and safe error details, but never include secrets, passwords, cookies, or tokens.

---

## Order of work

1. **First:** investigate the initial `401` authentication failures and the subsequent `429` rate limiting. Restore safe, legitimate Owner and moderator access.
2. **Second:** fix the Client Reviews crash and approval persistence.
3. **Third:** fix Adoptables save detection and implement the separate Adoptables Management permission.
4. **Fourth:** fix NO AI badge sizing and management controls.
5. **Fifth:** address measured performance problems and audit the remaining public/admin pages.
6. **Finally:** run tests and complete `WEBSITE_AUDIT.md`.

Inspect recent changes and the existing architecture before editing. Make the smallest safe changes that fix confirmed root causes. Preserve the website's existing branding, layout, icons, content, and functionality.

When finished, report the root causes, files changed, actual test results, anything still unresolved, and the repository location of `WEBSITE_AUDIT.md`.
