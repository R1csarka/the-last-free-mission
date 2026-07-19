import { NextResponse } from "next/server";
import { calculateAverages } from "@/lib/scoring";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { AdminStats, SubmissionRow } from "@/lib/types";

export async function GET(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("groom_evaluations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to load submissions." }, { status: 500 });
  }

  const rows = data as SubmissionRow[];
  const total = rows.length;
  const beerYes = rows.filter((row) => row.beer_yes_no).length;
  const stats: AdminStats = {
    total,
    averages: calculateAverages(rows),
    beerYesPercent: total ? Math.round((beerYes / total) * 100) : 0,
    beerNoPercent: total ? Math.round(((total - beerYes) / total) * 100) : 0,
    latest: rows.slice(0, 20),
    messages: rows
      .filter((row) => row.message_to_bride?.trim())
      .map(({ id, created_at, nickname, message_to_bride }) => ({
        id,
        created_at,
        nickname,
        message_to_bride
      }))
  };

  return NextResponse.json(stats);
}
