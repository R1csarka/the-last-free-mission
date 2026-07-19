import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionRow } from "@/lib/types";

const columns: Array<keyof SubmissionRow> = [
  "id",
  "created_at",
  "nickname",
  "looks",
  "style",
  "humor",
  "charisma",
  "beer_yes_no",
  "husband_index",
  "message_to_bride"
];

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
    return NextResponse.json({ error: error?.message ?? "Failed to export submissions." }, { status: 500 });
  }

  const csv = [
    columns.join(","),
    ...(data as SubmissionRow[]).map((row) =>
      columns.map((column) => csvEscape(String(row[column] ?? ""))).join(",")
    )
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"groom-evaluations.csv\""
    }
  });
}

function csvEscape(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}
