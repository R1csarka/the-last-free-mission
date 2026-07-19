"use client";

import { motion } from "framer-motion";
import { Download, Lock, MessageSquareText, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import type { AdminStats, SubmissionRow } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStats(event?: React.FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/submissions", {
        headers: {
          "x-admin-password": password
        }
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to load dashboard.");
      }

      setStats((await response.json()) as AdminStats);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    setError("");

    try {
      const response = await fetch("/api/admin/export", {
        headers: {
          "x-admin-password": password
        }
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to export CSV.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "groom-evaluations.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export CSV.");
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-asphalt text-white">
      <Background />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brass">Admin Dashboard</p>
            <h1 className="mission-title mt-2 font-display text-4xl uppercase leading-none text-champagne sm:text-6xl">
              Groom Control
            </h1>
          </div>
          {stats && (
            <button
              type="button"
              onClick={() => void loadStats()}
              className="grid size-12 place-items-center rounded-2xl border border-champagne/16 bg-white/[0.06] text-champagne transition hover:border-brass/60"
              aria-label="Refresh"
            >
              <RefreshCw size={22} />
            </button>
          )}
        </header>

        {!stats ? (
          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(event) => void loadStats(event)}
            className="glass mx-auto mt-12 w-full max-w-md rounded-[28px] p-5"
          >
            <div className="mb-6 grid size-16 place-items-center rounded-2xl border border-brass/35 bg-brass/10 text-brass">
              <Lock size={34} />
            </div>
            <h2 className="text-3xl font-black uppercase leading-none">Password protected</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-champagne/65">
              Enter the admin password configured in Vercel to view submissions.
            </p>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Admin password"
              className="mt-6 h-16 w-full rounded-2xl border border-champagne/18 bg-black/55 px-5 text-lg font-bold text-white outline-none transition focus:border-brass focus:shadow-glow"
            />
            <button
              type="submit"
              disabled={!password || loading}
              className="mt-4 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-brass px-6 text-lg font-black uppercase tracking-[0.16em] text-black shadow-glow transition hover:bg-brass/90 disabled:cursor-not-allowed disabled:bg-champagne/20 disabled:text-champagne/35 disabled:shadow-none"
            >
              <ShieldCheck size={23} />
              {loading ? "Loading" : "Enter"}
            </button>
            {error && <p className="mt-4 text-sm font-bold text-dangerPink">{error}</p>}
          </motion.form>
        ) : (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
            {error && (
              <div className="rounded-2xl border border-dangerPink/35 bg-dangerPink/10 p-4 text-sm font-bold text-dangerPink">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={<Users size={24} />} label="Total submissions" value={stats.total.toString()} />
              <MetricCard label="Average Looks" value={stats.averages.looks.toFixed(1)} />
              <MetricCard label="Average Style" value={stats.averages.style.toFixed(1)} />
              <MetricCard label="Average Humor" value={stats.averages.humor.toFixed(1)} />
              <MetricCard label="Average Charisma" value={stats.averages.charisma.toFixed(1)} />
              <MetricCard label="Average Husband Index" value={stats.averages.husband_index.toFixed(1)} />
              <MetricCard label="Beer Yes %" value={`${stats.beerYesPercent}%`} />
              <MetricCard label="Beer No %" value={`${stats.beerNoPercent}%`} />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void exportCsv()}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brass px-5 text-sm font-black uppercase tracking-[0.14em] text-black shadow-glow transition hover:bg-brass/90"
              >
                <Download size={19} />
                Export CSV
              </button>
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="glass rounded-[28px] p-4">
                <h2 className="mb-4 text-xl font-black uppercase tracking-[0.08em]">Latest submissions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
                    <thead>
                      <tr className="text-xs font-black uppercase tracking-[0.16em] text-champagne/48">
                        <th className="px-3 py-2">Agent</th>
                        <th className="px-3 py-2">Looks</th>
                        <th className="px-3 py-2">Style</th>
                        <th className="px-3 py-2">Humor</th>
                        <th className="px-3 py-2">Charisma</th>
                        <th className="px-3 py-2">Beer</th>
                        <th className="px-3 py-2">Husband</th>
                        <th className="px-3 py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.latest.map((submission) => (
                        <SubmissionTableRow key={submission.id} submission={submission} />
                      ))}
                    </tbody>
                  </table>
                  {stats.latest.length === 0 && (
                    <p className="rounded-2xl border border-champagne/12 bg-black/35 p-4 text-sm font-semibold text-champagne/60">
                      No submissions yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="glass rounded-[28px] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="text-brass" size={22} />
                  <h2 className="text-xl font-black uppercase tracking-[0.08em]">Messages to the bride</h2>
                </div>
                <div className="grid max-h-[600px] gap-3 overflow-y-auto pr-1">
                  {stats.messages.map((message) => (
                    <article key={message.id} className="rounded-2xl border border-champagne/12 bg-black/35 p-4">
                      <p className="text-sm font-semibold leading-6 text-champagne/85">{message.message_to_bride}</p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-brass">
                        {message.nickname || "Anonymous"} · {formatDate(message.created_at)}
                      </p>
                    </article>
                  ))}
                  {stats.messages.length === 0 && (
                    <p className="rounded-2xl border border-champagne/12 bg-black/35 p-4 text-sm font-semibold text-champagne/60">
                      No bride messages yet.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </section>
    </main>
  );
}

function Background() {
  return (
    <div aria-hidden="true" className="fixed inset-0">
      <div className="poster-background absolute inset-0 scale-110 opacity-40 blur-[6px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/84 via-black/72 to-black/94" />
      <div className="grain absolute inset-0" />
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between text-brass">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-champagne/55">{label}</p>
        {icon}
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function SubmissionTableRow({ submission }: { submission: SubmissionRow }) {
  return (
    <tr className="bg-black/35 text-sm font-bold text-champagne/84">
      <td className="rounded-l-xl px-3 py-3 text-white">{submission.nickname || "Anonymous"}</td>
      <td className="px-3 py-3">{submission.looks}</td>
      <td className="px-3 py-3">{submission.style}</td>
      <td className="px-3 py-3">{submission.humor}</td>
      <td className="px-3 py-3">{submission.charisma}</td>
      <td className="px-3 py-3">{submission.beer_yes_no ? "YES" : "NO"}</td>
      <td className="px-3 py-3">{submission.husband_index}</td>
      <td className="rounded-r-xl px-3 py-3 text-champagne/54">{formatDate(submission.created_at)}</td>
    </tr>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
