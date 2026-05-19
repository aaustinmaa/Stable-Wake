import type { SessionResult } from "../../../domain/models/SessionResult";
import type { SessionResultSummary } from "../../../domain/models/SessionResultSummary";

export function createSessionResultSummary(
  result: SessionResult,
  completedAtMs = Date.now()
): SessionResultSummary {
  return {
    id: `${completedAtMs}-${result.triggerTimestampMs}-${result.reasonCode}`,
    completedAtMs,
    triggerTimestampMs: result.triggerTimestampMs,
    wakeMode: result.wakeMode,
    latestWakeTime: result.latestWakeTime,
    wakeWindowMinutes: result.wakeWindowMinutes,
    reasonCode: result.reasonCode
  };
}

