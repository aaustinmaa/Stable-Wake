import type { ExplanationItem } from "./ExplanationItem";

export type WakeDecisionReasonCode = "stable_zone" | "drop_protection" | "latest_fallback" | null;

export type WakeDecision = {
  shouldTrigger: boolean;
  reasonCode: WakeDecisionReasonCode;
  explanationItems: ExplanationItem[];
};
