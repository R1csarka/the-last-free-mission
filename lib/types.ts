export type RatingKey = "looks" | "style" | "humor" | "charisma";

export type SubmissionPayload = {
  nickname?: string;
  looks: number;
  style: number;
  humor: number;
  charisma: number;
  beer_yes_no: boolean;
  husband_index: number;
  message_to_bride?: string;
};

export type RatingAverages = {
  looks: number;
  style: number;
  humor: number;
  charisma: number;
  husband_index: number;
  overall: number;
};

export type SubmissionRow = SubmissionPayload & {
  id: string;
  created_at: string;
};

export type AdminStats = {
  total: number;
  averages: RatingAverages;
  beerYesPercent: number;
  beerNoPercent: number;
  latest: SubmissionRow[];
  messages: Pick<SubmissionRow, "id" | "created_at" | "nickname" | "message_to_bride">[];
};
