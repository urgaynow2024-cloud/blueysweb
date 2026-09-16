import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import {
  type Role,
  type Permission,
  type SessionUser,
  PERMISSION_LIST,
  ownerPermissions,
} from "./permissions";

export type { Role, Permission, SessionUser } from "./permissions";
export { PERMISSION_LIST, ownerPermissions } from "./permissions";

export const SESSION_COOKIE = "bc_session";

export const OWNER_USERNAME = "owner";
export const DEFAULT_OWNER_PASSWORD = process.env.ADMIN_PASSWORD || "blueyadmin";

function secret(): string {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "insecure-dev-secret-change-me";
}

/* ----------------------------- Passwords ----------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ----------------------------- Sessions ------------------------------ */

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function signSession(user: SessionUser): string {
  const payloadB64 = b64url(JSON.stringify(user));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySession(token: string | undefined | null): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const user = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionUser;
    if (!user || (user.role !== "owner" && user.role !== "moderator")) return null;
    return user;
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/* --------------------------- Authorization --------------------------- */

export interface AuthResult {
  ok: boolean;
  session?: SessionUser;
  response?: Response;
}

export function authorize(
  req: NextRequest,
  opts: { role?: Role; perm?: Permission } = {}
): AuthResult {
  const session = getSession(req);
  if (!session) {
    return { ok: false, response: json({ error: "Not authenticated" }, 401) };
  }
  if (opts.role === "owner" && session.role !== "owner") {
    return { ok: false, response: json({ error: "Owner access required" }, 403) };
  }
  if (opts.perm && !session.perms[opts.perm]) {
    return { ok: false, response: json({ error: "You do not have permission for this action" }, 403) };
  }
  return { ok: true, session };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function isModeratorTableRow(row: any): SessionUser {
  return {
    id: row.id,
    username: row.username,
    name: row.display_name,
    role: row.role,
    perms: {
      reviews: Boolean(row.permissions?.reviews),
      submissions: Boolean(row.permissions?.submissions),
      hide_content: Boolean(row.permissions?.hide_content),
    },
  };
}
