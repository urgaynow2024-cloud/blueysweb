import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession, requirePermission } from "@/lib/auth/guard";
import { deleteAdoptable, updateAdoptable } from "@/lib/adoptables/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // The public site reads adoptables through the anon Supabase client, which
  // RLS already limits to listed rows. This route uses the service role, so it
  // can return HIDDEN rows and is admin-only.
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  const { id } = await params;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const { data, error } = await supabaseAdmin
    .from("adoptables")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: "Adoptable not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Partial updates are supported: only keys present in the body are written,
    // and media columns are never touched unless explicitly supplied. This is
    // what stopped the admin dashboard from wiping `main_image` on every save.
    const result = await updateAdoptable(id, body ?? {});
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (!result.row) {
      return NextResponse.json({ error: "Adoptable not found" }, { status: 404 });
    }
    return NextResponse.json(result.row);
  } catch (error: any) {
    console.error("Adoptable update error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  const { id } = await params;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { error } = await deleteAdoptable(id);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
