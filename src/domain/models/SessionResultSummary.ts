import type { ClockTime } from "./ClockTime";
import type { WakeDecisionReasonCode } from "./WakeDecision";
import type { WakeMode } from "./WakeMode";

export type SessionResultSummary = {
  id: string;
  completedAtMs: number;
  triggerTimestampMs: number;
  wakeMode: WakeMode;
  latestWakeTime: ClockTime;
  wakeWindowMinutes: number;
  reasonCode: Exclude<WakeDecisionReasonCode, null>;
};

