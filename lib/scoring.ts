import type { RatingAverages, SubmissionPayload, SubmissionRow } from "@/lib/types";

const ratingFields = ["looks", "style", "humor", "charisma", "husband_index"] as const;
type RatingSlice = Pick<SubmissionPayload, (typeof ratingFields)[number]>;

export function clampRating(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 10) {
    return null;
  }

  return numberValue;
}

export function normalizeSubmission(input: unknown): SubmissionPayload | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;
  const ratings = Object.fromEntries(
    ratingFields.map((field) => [field, clampRating(record[field])])
  ) as Record<(typeof ratingFields)[number], number | null>;

  if (ratingFields.some((field) => ratings[field] === null)) {
    return null;
  }

  if (typeof record.beer_yes_no !== "boolean") {
    return null;
  }

  const nickname = typeof record.nickname === "string" ? record.nickname.trim().slice(0, 80) : "";
  const message =
    typeof record.message_to_bride === "string"
      ? record.message_to_bride.trim().slice(0, 150)
      : "";

  return {
    nickname,
    looks: ratings.looks ?? 1,
    style: ratings.style ?? 1,
    humor: ratings.humor ?? 1,
    charisma: ratings.charisma ?? 1,
    beer_yes_no: record.beer_yes_no,
    husband_index: ratings.husband_index ?? 1,
    message_to_bride: message
  };
}

export function calculateAverages(rows: Array<RatingSlice | SubmissionPayload | SubmissionRow>): RatingAverages {
  if (rows.length === 0) {
    return {
      looks: 0,
      style: 0,
      humor: 0,
      charisma: 0,
      husband_index: 0,
      overall: 0
    };
  }

  const sums = rows.reduce(
    (acc, row) => {
      ratingFields.forEach((field) => {
        acc[field] += row[field];
      });
      return acc;
    },
    {
      looks: 0,
      style: 0,
      humor: 0,
      charisma: 0,
      husband_index: 0
    }
  );

  const averages = {
    looks: round(sums.looks / rows.length),
    style: round(sums.style / rows.length),
    humor: round(sums.humor / rows.length),
    charisma: round(sums.charisma / rows.length),
    husband_index: round(sums.husband_index / rows.length),
    overall: 0
  };

  averages.overall = round(
    (averages.looks + averages.style + averages.humor + averages.charisma + averages.husband_index) /
      5
  );

  return averages;
}

export function resultLabel(overall: number) {
  return overall >= 8 ? "APPROVED" : "APPROVED WITH MINOR WARNINGS";
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
