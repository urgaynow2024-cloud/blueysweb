import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json([]);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.toLowerCase() || "";
  if (!q) return NextResponse.json([]);

  const results: any[] = [];

  // Search portfolio
  const { data: portfolio } = await supabase.from("portfolio_images").select("id, url, category").ilike("category", `%${q}%`).limit(5);
  if (portfolio) portfolio.forEach((p: any) => results.push({ type: "portfolio", id: p.id, title: p.category, url: p.url }));

  // Search services
  const { data: services } = await supabase.from("services").select("id, title, desc").or(`title.ilike.%${q}%,desc.ilike.%${q}%`).limit(5);
  if (services) services.forEach((s: any) => results.push({ type: "service", id: s.id, title: s.title, url: "/services" }));

  // Search FAQ
  const { data: faq } = await supabase.from("faq_items").select("id, question, answer").or(`question.ilike.%${q}%,answer.ilike.%${q}%`).limit(5);
  if (faq) faq.forEach((f: any) => results.push({ type: "faq", id: f.id, title: f.question, url: "/faq" }));

  // Search TOS
  const { data: tos } = await supabase.from("tos_sections").select("id, title, items").or(`title.ilike.%${q}%`).limit(5);
  if (tos) tos.forEach((t: any) => results.push({ type: "tos", id: t.id, title: t.title, url: "/tos" }));

  return NextResponse.json(results);
}
