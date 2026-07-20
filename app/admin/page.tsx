"use client";

import { motion } from "framer-motion";
import { Download, Lock, MessageSquareText, RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { AdminStats, SubmissionRow } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

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
        throw new Error(body?.error ?? "Failed to export Excel.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "martinka-ertekelesek.xls";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export Excel.");
    }
  }

  async function resetSubmissions() {
    if (!stats?.total) {
      return;
    }

    const confirmed = window.confirm(
      `Biztosan törlöd az összes választ? Ez ${stats.total} beküldést töröl, és nem lehet visszavonni.`
    );

    if (!confirmed) {
      return;
    }

    setResetting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: {
          "x-admin-password": password
        }
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Nem sikerült törölni a válaszokat.");
      }

      await loadStats();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Nem sikerült törölni a válaszokat.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-asphalt text-white">
      <Background />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl min-w-0 flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brass sm:text-xs sm:tracking-[0.28em]">
              Admin Dashboard
            </p>
            <h1 className="mission-title mt-2 font-display text-[38px] uppercase leading-none text-champagne sm:text-6xl">
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
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid min-w-0 gap-4">
            {error && (
              <div className="rounded-2xl border border-dangerPink/35 bg-dangerPink/10 p-4 text-sm font-bold text-dangerPink">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={<Users size={24} />} label="Összes válasz" value={stats.total.toString()} />
              <MetricCard label="Átlag megjelenés" value={stats.averages.looks.toFixed(1)} />
              <MetricCard label="Átlag stílus" value={stats.averages.style.toFixed(1)} />
              <MetricCard label="Átlag kisugárzás" value={stats.averages.humor.toFixed(1)} />
              <MetricCard label="Átlag első benyomás" value={stats.averages.charisma.toFixed(1)} />
              <MetricCard label="Átlag férj index" value={stats.averages.husband_index.toFixed(1)} />
              <MetricCard label="Sör igen %" value={`${stats.beerYesPercent}%`} />
              <MetricCard label="Sör nem %" value={`${stats.beerNoPercent}%`} />
            </div>

            <div className="grid gap-3 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => void resetSubmissions()}
                disabled={resetting || stats.total === 0}
                className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl border border-dangerPink/45 bg-dangerPink/12 px-4 text-xs font-black uppercase tracking-[0.1em] text-dangerPink transition hover:bg-dangerPink/18 disabled:cursor-not-allowed disabled:border-champagne/12 disabled:bg-white/[0.04] disabled:text-champagne/30 sm:px-5 sm:text-sm sm:tracking-[0.14em]"
              >
                <Trash2 size={18} />
                {resetting ? "Törlés..." : "Összes válasz törlése"}
              </button>
              <button
                type="button"
                onClick={() => void exportCsv()}
                className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-brass px-4 text-xs font-black uppercase tracking-[0.12em] text-black shadow-glow transition hover:bg-brass/90 sm:px-5 sm:text-sm sm:tracking-[0.14em]"
              >
                <Download size={19} />
                Excel export
              </button>
            </div>

            <section className="grid min-w-0 gap-4 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="glass min-w-0 rounded-[24px] p-3 sm:rounded-[28px] sm:p-4">
                <h2 className="mb-4 text-lg font-black uppercase tracking-[0.06em] sm:text-xl sm:tracking-[0.08em]">
                  Legutóbbi válaszok
                </h2>

                <div className="grid gap-3 md:hidden">
                  {stats.latest.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                  {stats.latest.length === 0 && (
                    <p className="rounded-2xl border border-champagne/12 bg-black/35 p-4 text-sm font-semibold text-champagne/60">
                      Még nincs válasz.
                    </p>
                  )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
                    <thead>
                      <tr className="text-xs font-black uppercase tracking-[0.16em] text-champagne/48">
                        <th className="px-3 py-2">Név</th>
                        <th className="px-3 py-2">Megjelenés</th>
                        <th className="px-3 py-2">Stílus</th>
                        <th className="px-3 py-2">Kisugárzás</th>
                        <th className="px-3 py-2">Első benyomás</th>
                        <th className="px-3 py-2">Sör</th>
                        <th className="px-3 py-2">Férj</th>
                        <th className="px-3 py-2">Idő</th>
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
                      Még nincs válasz.
                    </p>
                  )}
                </div>
              </div>

              <div className="glass min-w-0 rounded-[24px] p-3 sm:rounded-[28px] sm:p-4">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="shrink-0 text-brass" size={22} />
                  <h2 className="min-w-0 text-lg font-black uppercase leading-tight tracking-[0.04em] sm:text-xl sm:tracking-[0.08em]">
                    Üzenetek a menyasszonynak
                  </h2>
                </div>
                <div className="grid max-h-[600px] gap-3 overflow-y-auto pr-1">
                  {stats.messages.map((message) => (
                    <article key={message.id} className="rounded-2xl border border-champagne/12 bg-black/35 p-4">
                      <p className="text-sm font-semibold leading-6 text-champagne/85">{message.message_to_bride}</p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-brass">
                        {message.nickname || "Névtelen"} · {formatDate(message.created_at)}
                      </p>
                    </article>
                  ))}
                  {stats.messages.length === 0 && (
                    <p className="rounded-2xl border border-champagne/12 bg-black/35 p-4 text-sm font-semibold text-champagne/60">
                      Még nincs menyasszonynak szóló üzenet.
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
    <div className="glass min-w-0 rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between text-brass">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-champagne/55">{label}</p>
        {icon}
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: SubmissionRow }) {
  return (
    <article className="rounded-2xl border border-champagne/12 bg-black/35 p-4 text-sm font-bold text-champagne/84">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{submission.nickname || "Névtelen"}</p>
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-champagne/48">
            {formatDate(submission.created_at)}
          </p>
        </div>
        <span className="rounded-full border border-brass/35 bg-brass/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-brass">
          {submission.beer_yes_no ? "Sör: igen" : "Sör: nem"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MobileScore label="Megjelenés" value={submission.looks} />
        <MobileScore label="Stílus" value={submission.style} />
        <MobileScore label="Kisugárzás" value={submission.humor} />
        <MobileScore label="Első benyomás" value={submission.charisma} />
        <MobileScore label="Férj index" value={submission.husband_index} />
      </div>
    </article>
  );
}

function MobileScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-champagne/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-champagne/48">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function SubmissionTableRow({ submission }: { submission: SubmissionRow }) {
  return (
    <tr className="bg-black/35 text-sm font-bold text-champagne/84">
      <td className="rounded-l-xl px-3 py-3 text-white">{submission.nickname || "Névtelen"}</td>
      <td className="px-3 py-3">{submission.looks}</td>
      <td className="px-3 py-3">{submission.style}</td>
      <td className="px-3 py-3">{submission.humor}</td>
      <td className="px-3 py-3">{submission.charisma}</td>
      <td className="px-3 py-3">{submission.beer_yes_no ? "IGEN" : "NEM"}</td>
      <td className="px-3 py-3">{submission.husband_index}</td>
      <td className="rounded-r-xl px-3 py-3 text-champagne/54">{formatDate(submission.created_at)}</td>
    </tr>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
