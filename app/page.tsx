"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Beer, ChevronLeft, ChevronRight, Crosshair, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateAverages, resultLabel } from "@/lib/scoring";
import type { RatingAverages, RatingKey, SubmissionPayload } from "@/lib/types";

type QuizStep = "home" | "identity" | "ratings" | "beer" | "husband" | "message" | "loading" | "result";
type NullableRatingMap = Record<RatingKey, number | null>;

const ratingLabels: Array<{ key: RatingKey; label: string }> = [
  { key: "looks", label: "Looks" },
  { key: "style", label: "Style" },
  { key: "humor", label: "Humor" },
  { key: "charisma", label: "Charisma" }
];

const loadingMessages = [
  "Connecting to Rockstar Social Club...",
  "Scanning candidate...",
  "Checking criminal records...",
  "Checking relationship stability...",
  "Evaluating husband potential...",
  "Consulting Fanni...",
  "Generating report..."
];

const orderedSteps: QuizStep[] = ["home", "identity", "ratings", "beer", "husband", "message"];

export default function HomePage() {
  const [step, setStep] = useState<QuizStep>("home");
  const [nickname, setNickname] = useState("");
  const [ratings, setRatings] = useState<NullableRatingMap>({
    looks: null,
    style: null,
    humor: null,
    charisma: null
  });
  const [beer, setBeer] = useState<boolean | null>(null);
  const [husbandIndex, setHusbandIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [result, setResult] = useState<{
    averages: RatingAverages;
    verdict: string;
    saved: boolean;
    demo?: boolean;
  } | null>(null);

  const stepIndex = orderedSteps.indexOf(step);
  const canContinue = useMemo(() => {
    if (step === "ratings") {
      return Object.values(ratings).every((value) => value !== null);
    }

    if (step === "beer") {
      return beer !== null;
    }

    if (step === "husband") {
      return husbandIndex !== null;
    }

    return true;
  }, [beer, husbandIndex, ratings, step]);

  function goBack() {
    if (stepIndex > 0) {
      setStep(orderedSteps[stepIndex - 1]);
    }
  }

  function goNext() {
    if (!canContinue) {
      return;
    }

    if (step === "message") {
      void submit();
      return;
    }

    setStep(orderedSteps[Math.min(stepIndex + 1, orderedSteps.length - 1)]);
  }

  async function submit() {
    if (!isComplete()) {
      return;
    }

    const payload: SubmissionPayload = {
      nickname,
      looks: ratings.looks ?? 1,
      style: ratings.style ?? 1,
      humor: ratings.humor ?? 1,
      charisma: ratings.charisma ?? 1,
      beer_yes_no: beer ?? false,
      husband_index: husbandIndex ?? 1,
      message_to_bride: message
    };

    setStep("loading");
    setLoadingIndex(0);

    const timer = window.setInterval(() => {
      setLoadingIndex((current) => Math.min(current + 1, loadingMessages.length - 1));
    }, 320);

    const savePromise = fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Submission failed.");
        }
        return response.json() as Promise<{
          averages: RatingAverages;
          verdict: string;
          saved: boolean;
          demo?: boolean;
        }>;
      })
      .catch(() => {
        const averages = calculateAverages([payload]);
        return {
          averages,
          verdict: resultLabel(averages.overall),
          saved: false
        };
      });

    const [response] = await Promise.all([
      savePromise,
      new Promise((resolve) => window.setTimeout(resolve, 2100))
    ]);

    window.clearInterval(timer);
    setResult(response);
    setStep("result");
  }

  function isComplete() {
    return (
      ratings.looks !== null &&
      ratings.style !== null &&
      ratings.humor !== null &&
      ratings.charisma !== null &&
      beer !== null &&
      husbandIndex !== null
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-asphalt text-white">
      <Background />

      <section className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-5 sm:px-6">
        <div className="w-full max-w-[460px]">
          <div className="mb-4 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-champagne/70">
            <span>Rockstar Evaluations</span>
            <span className="rounded-full border border-brass/40 bg-black/40 px-3 py-1 text-brass">NFC</span>
          </div>

          <div className="glass min-h-[640px] rounded-[28px] p-5 shadow-gold sm:p-6">
            <AnimatePresence mode="wait">
              {step === "home" && (
                <StepFrame key="home">
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div>
                      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brass/35 bg-brass/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-brass">
                        <Crosshair size={15} />
                        Mission active
                      </div>
                      <h1 className="mission-title font-display text-[56px] uppercase leading-[0.88] text-champagne sm:text-[68px]">
                        THE LAST FREE MISSION
                      </h1>
                      <p className="mt-4 text-lg font-black uppercase tracking-[0.18em] text-dangerPink">
                        Official Groom Evaluation
                      </p>
                    </div>

                    <div className="rounded-2xl border border-champagne/15 bg-black/45 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-champagne/55">Candidate</p>
                      <p className="mt-2 text-3xl font-black text-white">Martin &quot;Martinka&quot;</p>
                      <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-brass">
                        Future Husband Candidate
                      </p>
                    </div>

                    <PrimaryButton onClick={() => setStep("identity")} testId="start-mission">
                      START
                    </PrimaryButton>
                  </div>
                </StepFrame>
              )}

              {step === "identity" && (
                <StepFrame key="identity">
                  <QuestionShell
                    eyebrow="Question 1"
                    title="Who are you?"
                    footer={<StepControls onBack={goBack} onNext={goNext} nextLabel="Next" canContinue />}
                  >
                    <label className="block">
                      <span className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-champagne/60">
                        Optional agent alias
                      </span>
                      <input
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                        maxLength={80}
                        placeholder="Nickname or full name"
                        className="h-16 w-full rounded-2xl border border-champagne/18 bg-black/55 px-5 text-lg font-bold text-white outline-none transition focus:border-brass focus:shadow-glow"
                      />
                    </label>
                  </QuestionShell>
                </StepFrame>
              )}

              {step === "ratings" && (
                <StepFrame key="ratings">
                  <QuestionShell
                    eyebrow="Question 2"
                    title="Rate Martin."
                    footer={<StepControls onBack={goBack} onNext={goNext} nextLabel="Next" canContinue={canContinue} />}
                  >
                    <div className="space-y-4">
                      {ratingLabels.map(({ key, label }) => (
                        <RatingControl
                          key={key}
                          label={label}
                          testId={`rating-${key}`}
                          value={ratings[key]}
                          onChange={(value) => setRatings((current) => ({ ...current, [key]: value }))}
                        />
                      ))}
                    </div>
                  </QuestionShell>
                </StepFrame>
              )}

              {step === "beer" && (
                <StepFrame key="beer">
                  <QuestionShell
                    eyebrow="Question 3"
                    title="Would you drink a beer with Martin?"
                    footer={<StepControls onBack={goBack} onNext={goNext} nextLabel="Next" canContinue={canContinue} />}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <ChoiceButton testId="beer-yes" active={beer === true} onClick={() => setBeer(true)}>
                        YES
                      </ChoiceButton>
                      <ChoiceButton testId="beer-no" active={beer === false} onClick={() => setBeer(false)}>
                        NO
                      </ChoiceButton>
                    </div>
                    <div className="mt-8 flex justify-center text-brass">
                      <Beer size={72} strokeWidth={1.2} />
                    </div>
                  </QuestionShell>
                </StepFrame>
              )}

              {step === "husband" && (
                <StepFrame key="husband">
                  <QuestionShell
                    eyebrow="Question 4"
                    title="How good of a husband do you think Martin will be?"
                    footer={<StepControls onBack={goBack} onNext={goNext} nextLabel="Next" canContinue={canContinue} />}
                  >
                    <RatingControl
                      label="Husband Index"
                      testId="rating-husband"
                      value={husbandIndex}
                      onChange={setHusbandIndex}
                      large
                    />
                  </QuestionShell>
                </StepFrame>
              )}

              {step === "message" && (
                <StepFrame key="message">
                  <QuestionShell
                    eyebrow="Question 5"
                    title="Message to the bride"
                    footer={<StepControls onBack={goBack} onNext={goNext} nextLabel="Submit" canContinue />}
                  >
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value.slice(0, 150))}
                      maxLength={150}
                      placeholder="Optional. Maximum 150 characters."
                      data-testid="bride-message"
                      className="min-h-44 w-full resize-none rounded-2xl border border-champagne/18 bg-black/55 p-5 text-lg font-bold text-white outline-none transition focus:border-brass focus:shadow-glow"
                    />
                    <p className="mt-3 text-right text-xs font-black uppercase tracking-[0.18em] text-champagne/50">
                      {message.length}/150
                    </p>
                  </QuestionShell>
                </StepFrame>
              )}

              {step === "loading" && (
                <StepFrame key="loading">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="mb-8 grid size-28 place-items-center rounded-full border border-brass/40 bg-brass/10 text-brass shadow-glow"
                    >
                      <Crosshair size={52} strokeWidth={1.4} />
                    </motion.div>
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-champagne/55">Processing</p>
                    <p className="mt-4 min-h-16 text-3xl font-black uppercase leading-tight text-white">
                      {loadingMessages[loadingIndex]}
                    </p>
                  </div>
                </StepFrame>
              )}

              {step === "result" && result && (
                <StepFrame key="result">
                  <div className="flex h-full flex-col gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.28em] text-brass">MISSION COMPLETE</p>
                      <h2 className="mission-title mt-2 font-display text-[38px] uppercase leading-[0.9] text-champagne">
                        Official Groom Analysis
                      </h2>
                    </div>

                    <div className="grid gap-2">
                      <ScoreRow label="Looks" value={result.averages.looks} />
                      <ScoreRow label="Style" value={result.averages.style} />
                      <ScoreRow label="Humor" value={result.averages.humor} />
                      <ScoreRow label="Charisma" value={result.averages.charisma} />
                      <ScoreRow label="Husband Index" value={result.averages.husband_index} />
                    </div>

                    <div className="approval-glow mt-auto rounded-2xl border border-approval/40 bg-approval/12 p-3 text-center">
                      <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-approval text-black">
                        <ShieldCheck size={30} />
                      </div>
                      <p className="text-xl font-black uppercase tracking-[0.08em] text-approval">{result.verdict}</p>
                      <p className="mt-2 text-balance text-sm font-semibold leading-5 text-champagne/85">
                        According to the evaluation, Martin is suitable for marriage. Fanni&apos;s decision appears
                        justified.
                      </p>
                      {(!result.saved || result.demo) && (
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-champagne/45">
                          Demo result shown until Supabase is configured.
                        </p>
                      )}
                    </div>
                  </div>
                </StepFrame>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}

function Background() {
  return (
    <div aria-hidden="true" className="fixed inset-0">
      <div className="poster-background absolute inset-0 scale-110 opacity-55 blur-[5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/82 via-black/68 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(216,175,61,0.2),transparent_38%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}

function StepFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="h-[600px]"
    >
      {children}
    </motion.div>
  );
}

function QuestionShell({
  eyebrow,
  title,
  children,
  footer
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-brass">{eyebrow}</p>
        <h2 className="mt-3 text-balance text-4xl font-black uppercase leading-[1.02] text-white">{title}</h2>
      </div>
      <div className="flex flex-1 flex-col justify-center py-6">{children}</div>
      {footer}
    </div>
  );
}

function RatingControl({
  label,
  testId,
  value,
  onChange,
  large = false
}: {
  label: string;
  testId: string;
  value: number | null;
  onChange: (value: number) => void;
  large?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-champagne/70">{label}</span>
        <span className="text-sm font-black text-brass">{value ?? "-"}/10</span>
      </div>
      <div data-testid={testId} className={`grid grid-cols-5 gap-2 ${large ? "sm:grid-cols-10" : ""}`}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`h-12 rounded-xl border text-base font-black transition active:scale-95 ${
              value === rating
                ? "border-brass bg-brass text-black shadow-glow"
                : "border-champagne/14 bg-white/[0.06] text-champagne hover:border-brass/60"
            }`}
            aria-pressed={value === rating}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceButton({
  testId,
  active,
  onClick,
  children
}: {
  testId: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex h-24 items-center justify-center rounded-2xl border text-3xl font-black transition active:scale-95 ${
        active
          ? "border-brass bg-brass text-black shadow-glow"
          : "border-champagne/16 bg-white/[0.06] text-white hover:border-brass/60"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function StepControls({
  onBack,
  onNext,
  nextLabel,
  canContinue
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  canContinue: boolean;
}) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <button
        type="button"
        onClick={onBack}
        data-testid="back-step"
        className="grid h-16 place-items-center rounded-2xl border border-champagne/16 bg-white/[0.06] text-champagne transition hover:border-champagne/35 active:scale-95"
        aria-label="Back"
      >
        <ChevronLeft size={28} />
      </button>
      <PrimaryButton onClick={onNext} disabled={!canContinue} testId="next-step">
        <span>{nextLabel}</span>
        <ChevronRight size={24} />
      </PrimaryButton>
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  testId,
  children
}: {
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-brass px-6 text-lg font-black uppercase tracking-[0.16em] text-black shadow-glow transition hover:bg-brass/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-champagne/20 disabled:text-champagne/35 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-champagne/12 bg-black/36 px-4 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-black uppercase tracking-[0.16em] text-champagne/72">{label}</span>
        <span className="text-lg font-black text-white">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-brass" style={{ width: `${Math.max(0, Math.min(100, value * 10))}%` }} />
      </div>
    </div>
  );
}
