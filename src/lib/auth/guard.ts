import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionUser } from "./index";
import { json } from "./index";

export interface AdminGuardResult {
  ok: boolean;
  session?: SessionUser;
  response?: Response;
}

/**
 * Route-handler counterpart to `authorize()`.
 *
 * `authorize()` takes a `NextRequest`, which route handlers do not receive, so
 * this reads the session straight from the request cookies instead. It keeps the
 * existing custom HMAC cookie scheme (no Supabase auth session) as the single
 * gate for admin writes.
 */
export async function requireAdminSession(): Promise<AdminGuardResult> {
  const jar = await cookies();
  const session = verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return {
      ok: false,
      response: json({ error: "Not authenticated" }, 401),
    };
  }
  return { ok: true, session };
}

export { json };
