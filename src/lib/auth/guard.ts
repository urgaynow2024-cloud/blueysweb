import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionUser, type Permission } from "./index";
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

/**
 * Require a session that also holds a specific permission.
 *
 * Used by every moderation + adoptables write route so a moderator who lacks
 * the toggle cannot perform the action, regardless of what the UI claims.
 */
export async function requirePermission(
  perm: Permission
): Promise<AdminGuardResult> {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard;
  const session = guard.session!;
  if (session.role === "owner") return guard;
  if (!session.perms[perm]) {
    return {
      ok: false,
      response: json(
        { error: "You do not have permission for this action" },
        403
      ),
    };
  }
  return guard;
}

/**
 * Require the owner role specifically. Used by settings/migration routes
 * that must never be reachable by a moderator, even with every toggle on.
 */
export async function requireOwnerSession(): Promise<AdminGuardResult> {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard;
  if (guard.session!.role !== "owner") {
    return {
      ok: false,
      response: json({ error: "Owner access required" }, 403),
    };
  }
  return guard;
}

export { json };
