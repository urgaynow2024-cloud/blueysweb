import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { deleteAdoptable, setAdoptableStatusBulk } from "@/lib/adoptables/server";
import { ADOPTABLE_STATUSES } from "@/lib/adoptables/status";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && UUID_RE.test(id));
}

/**
 * Bulk lifecycle actions for the admin dashboard.
 *
 * `action: "status"` is additive and reversible. `action: "delete"` is
 * destructive and is only reachable after the client has shown its own
 * confirmation; the server still requires an authenticated session.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const body = await request.json();
    const ids = parseIds(body?.ids);
    const action = body?.action;

    if (ids.length === 0) {
      return NextResponse.json({ error: "No adoptables selected" }, { status: 400 });
    }

    if (action === "status") {
      const status = body?.status;
      if (typeof status !== "string" || !ADOPTABLE_STATUSES.includes(status as any)) {
        return NextResponse.json(
          { error: `status must be one of: ${ADOPTABLE_STATUSES.join(", ")}` },
          { status: 400 },
        );
      }
      const result = await setAdoptableStatusBulk(ids, status);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ success: true, action, status, updated: result.updated });
    }

    if (action === "delete") {
      if (body?.confirm !== true) {
        return NextResponse.json(
          { error: "Permanent deletion requires an explicit confirmation" },
          { status: 400 },
        );
      }
      const failed: string[] = [];
      for (const id of ids) {
        const { error } = await deleteAdoptable(id);
        if (error) failed.push(id);
      }
      if (failed.length > 0) {
        return NextResponse.json(
          { error: `Failed to delete ${failed.length} adoptable(s)`, failed },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true, action, deleted: ids.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Adoptable bulk action error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
