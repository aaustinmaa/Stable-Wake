import type { AlarmSettings } from "./AlarmSettings";
import type { ClockTime } from "./ClockTime";
import type { ExplanationItem } from "./ExplanationItem";
import type { WakeDecisionReasonCode } from "./WakeDecision";
import type { WakeMode } from "./WakeMode";
import type { WakeScore } from "./WakeScore";

export type SessionResult = {
  triggerTimestampMs: number;
  wakeMode: WakeMode;
  latestWakeTime: ClockTime;
  wakeWindowMinutes: number;
  reasonCode: Exclude<WakeDecisionReasonCode, null>;
  explanationItems: ExplanationItem[];
  wakeScores: WakeScore[];
  selectedSettings: AlarmSettings;
};

