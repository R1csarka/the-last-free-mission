import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionRow } from "@/lib/types";

const delimiter = ";";
const columns: Array<{ key: keyof SubmissionRow; label: string; format?: (value: SubmissionRow[keyof SubmissionRow]) => string }> = [
  { key: "id", label: "Azonosító" },
  { key: "created_at", label: "Beküldés ideje", format: (value) => formatDate(String(value ?? "")) },
  { key: "nickname", label: "Név" },
  { key: "looks", label: "Megjelenés" },
  { key: "style", label: "Stílus" },
  { key: "humor", label: "Kisugárzás" },
  { key: "charisma", label: "Első benyomás" },
  { key: "beer_yes_no", label: "Sör Martinnal", format: (value) => (value ? "IGEN" : "NEM") },
  { key: "husband_index", label: "Férj index" },
  { key: "message_to_bride", label: "Üzenet a menyasszonynak" }
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
    "sep=;",
    columns.map((column) => csvEscape(column.label)).join(delimiter),
    ...(data as SubmissionRow[]).map((row) =>
      columns
        .map((column) => {
          const rawValue = row[column.key];
          return csvEscape(column.format ? column.format(rawValue) : String(rawValue ?? ""));
        })
        .join(delimiter)
    )
  ].join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"martinka-ertekelesek.csv\""
    }
  });
}

function csvEscape(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Budapest"
  }).format(new Date(value));
}
