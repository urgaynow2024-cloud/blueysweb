import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { setAdoptableStatus } from "@/lib/adoptables/server";
import { ADOPTABLE_STATUSES } from "@/lib/adoptables/status";

/**
 * Atomic lifecycle transition for the admin quick-status control.
 *
 * SOLD does not delete anything: the row, its images, description, pricing and
 * character details all stay exactly as they are and simply stop being
 * purchasable. Moving it back to AVAILABLE restores it automatically.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body?.status;

    if (typeof status !== "string" || !ADOPTABLE_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: `status must be one of: ${ADOPTABLE_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    const result = await setAdoptableStatus(id, status);
    if (result.error || !result.row) {
      return NextResponse.json(
        { error: result.error || "Failed to update status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, adoptable: result.row });
  } catch (error: any) {
    console.error("Adoptable status update error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
