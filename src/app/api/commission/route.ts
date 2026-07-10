import { NextResponse } from "next/server";

export const runtime = "edge";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1525237333664989184/cvq6GJFloKC-WhLeRMqBWJCxU46SwzvsABl8iFKd_vu9VmU51t_dYLnalR91zR4wxpUZ";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, discord, description, budget, deadline, references, notes } = data;

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
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, await response.text());
      return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Commission webhook error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
