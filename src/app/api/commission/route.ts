import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Discord notification webhook.
 *
 * This used to be hardcoded directly in this file, which committed a live
 * webhook token to the repository. It now reads from the environment.
 * See DISCORD_WEBHOOK_URL in .env.local.example.
 */
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

/** Upper bound on how long the Discord notification may delay the response. */
const WEBHOOK_TIMEOUT_MS = 5000;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, discord, email, description, budget, deadline, references, notes, agreed, owns_assets, adoptable_proof, refunds_understood } = data;

    if (!agreed || !owns_assets) {
      return NextResponse.json({ error: "Agreement required" }, { status: 400 });
    }

    // A commission request is meaningless without these.
    const missing = [];
    if (!name || !String(name).trim()) missing.push("name");
    if (!description || String(description).trim().length < 10) missing.push("description");
    if (!discord && !email) missing.push("discord or email");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      console.error("Commission submission rejected: Supabase admin client not configured.");
      return NextResponse.json(
        { error: "Server is not configured to accept commissions" },
        { status: 500 },
      );
    }

    const message = {
      embeds: [
        {
          title: "🎨 New Commission Request",
          color: 8388474,
          fields: [
            { name: "Name", value: name || "N/A", inline: true },
            { name: "Discord", value: discord || "N/A", inline: true },
            { name: "Description", value: description || "N/A", inline: false },
            { name: "Budget", value: budget || "N/A", inline: true },
            { name: "Deadline", value: deadline || "N/A", inline: true },
            { name: "References", value: references || "None", inline: false },
            { name: "Notes", value: notes || "None", inline: false },
            { name: "Agreed to TOS", value: agreed ? "Yes" : "No", inline: true },
            { name: "Owns Assets", value: owns_assets ? "Yes" : "No", inline: true },
            { name: "Adoptable Proof Required", value: adoptable_proof ? "Yes" : "No", inline: true },
            { name: "Refunds Understood", value: refunds_understood ? "Yes" : "No", inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Store the submission for moderator review (pending until approved/hidden).
    // The result MUST be checked: previously the error was ignored and the
    // route still answered { success: true }, so the UI claimed a commission
    // was received even when nothing was written to the database.
    const { error: insertError } = await supabaseAdmin.from("commission_submissions").insert([
      {
        name: name || null,
        discord: discord || null,
        email: email || null,
        description: description || "",
        budget: budget || null,
        deadline: deadline || null,
        reference_links: references || null,
        notes: notes || null,
        status: "pending",
      },
    ]);

    if (insertError) {
      console.error("Commission submission insert failed:", insertError.message);
      return NextResponse.json(
        { error: "Could not save your request. Please try again." },
        { status: 500 },
      );
    }

    // Notification is best-effort only. The submission is already safely
    // stored, so a webhook failure must not fail the user's request.
    //
    // The fetch is given a hard timeout. Previously it was awaited unbounded:
    // if Discord was slow or unreachable the request handler hung open, the
    // browser's fetch to /api/commission eventually aborted, and the visitor
    // saw a TimeoutError in the console even though their submission had in
    // fact been saved. Failing fast keeps the client response prompt.
    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
        });
      } catch (webhookError) {
        console.error("Discord webhook failed:", webhookError);
      }
    } else {
      console.warn("DISCORD_WEBHOOK_URL is not set; commission stored but not announced to Discord.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Commission submission error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
