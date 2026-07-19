import { NextResponse } from "next/server";
import { calculateAverages, normalizeSubmission, resultLabel } from "@/lib/scoring";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  const payload = normalizeSubmission(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    const averages = calculateAverages([payload]);
    return NextResponse.json({
      saved: false,
      demo: true,
      averages,
      verdict: resultLabel(averages.overall)
    });
  }

  const supabase = getSupabaseAdmin();
  const { error: insertError } = await supabase.from("groom_evaluations").insert(payload);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data, error: selectError } = await supabase
    .from("groom_evaluations")
    .select("looks, style, humor, charisma, husband_index");

  if (selectError || !data) {
    const averages = calculateAverages([payload]);
    return NextResponse.json({
      saved: true,
      averages,
      verdict: resultLabel(averages.overall)
    });
  }

  const averages = calculateAverages(data);

  return NextResponse.json({
    saved: true,
    averages,
    verdict: resultLabel(averages.overall)
  });
}
