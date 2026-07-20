import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionRow } from "@/lib/types";

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

  const rows = data as SubmissionRow[];
  const tableHead = columns.map((column) => `<th>${htmlEscape(column.label)}</th>`).join("");
  const tableRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          const rawValue = row[column.key];
          const value = column.format ? column.format(rawValue) : String(rawValue ?? "");
          return `<td>${htmlEscape(value)}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  const workbook = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; }
      th { background: #0e0e0e; color: #f8f8f8; font-weight: 700; }
      th, td { border: 1px solid #999; padding: 8px 10px; white-space: nowrap; }
      td { mso-number-format: "\\@"; }
    </style>
  </head>
  <body>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`;

  return new NextResponse(`\uFEFF${workbook}`, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"martinka-ertekelesek.xls\""
    }
  });
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
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
