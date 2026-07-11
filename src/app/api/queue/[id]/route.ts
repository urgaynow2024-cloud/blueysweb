import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, stage, progress, estimated_completion, status, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (stage !== undefined) updateData.stage = stage;
    if (progress !== undefined) updateData.progress = progress;
    if (estimated_completion !== undefined) updateData.estimated_completion = estimated_completion;
    if (status !== undefined) updateData.status = status;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("queue_items")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      console.error("Queue update error:", error);
      return NextResponse.json({ error: "Failed to update queue item" }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("queue_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Queue delete error:", error);
      return NextResponse.json({ error: "Failed to delete queue item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
