import type { WakeDecision } from "../models/WakeDecision";
import type { WakeScore } from "../models/WakeScore";
import { detectStableWakeZone, hasStrongRecentDrop } from "./detectStableWakeZone";
import type { WakeEngineInput, WakeModeConfig } from "./wakeEngine.types";

function noTrigger(): WakeDecision {
  return {
    shouldTrigger: false,
    reasonCode: null,
    explanationItems: []
  };
}

function latestFallbackDecision(): WakeDecision {
  return {
    shouldTrigger: true,
    reasonCode: "latest_fallback",
    explanationItems: [
      {
        code: "latest_wake_time_reached",
        title: "Latest wake time reached",
        description: "The session reached the latest selected wake time, so the alarm should trigger now."
      }
    ]
  };
}

function stableZoneDecision(): WakeDecision {
  return {
    shouldTrigger: true,
    reasonCode: "stable_zone",
    explanationItems: [
      {
        code: "stable_wake_zone_sustained",
        title: "Stable wake zone sustained",
        description: "Wakeability stayed high and stable long enough for the selected wake mode."
      }
    ]
  };
}

function dropProtectionDecision(): WakeDecision {
  return {
    shouldTrigger: true,
    reasonCode: "drop_protection",
    explanationItems: [
      {
        code: "opportunity_would_be_lost",
        title: "Wake opportunity degrading",
        description: "A stable wakeable period was present, but recent samples started dropping."
      }
    ]
  };
}

function getStableStreakDurationMs(
  scores: WakeScore[],
  currentIndex: number,
  input: WakeEngineInput,
  config: WakeModeConfig
): number {
  let streakStartMs: number | null = null;

  for (let index = currentIndex; index >= 0; index -= 1) {
    const score = scores[index];
    const stable = detectStableWakeZone(
      scores,
      index,
      config,
      score.timestampMs >= input.wakeWindowStartMs && score.timestampMs < input.latestWakeTimeMs
    );

    if (!stable) {
      break;
    }

    streakStartMs = score.timestampMs;
  }

  return streakStartMs === null ? 0 : scores[currentIndex].timestampMs - streakStartMs;
}

function hadRecentStableOpportunity(
  scores: WakeScore[],
  currentIndex: number,
  input: WakeEngineInput,
  config: WakeModeConfig
): boolean {
  const previousIndex = currentIndex - 1;

  if (previousIndex < 0) {
    return false;
  }

  const previousStable = detectStableWakeZone(
    scores,
    previousIndex,
    config,
    scores[previousIndex].timestampMs >= input.wakeWindowStartMs &&
      scores[previousIndex].timestampMs < input.latestWakeTimeMs
  );

  return previousStable && getStableStreakDurationMs(scores, previousIndex, input, config) >= config.candidateHoldMs;
}

export function decideWakeTrigger(
  scores: WakeScore[],
  currentIndex: number,
  input: WakeEngineInput,
  config: WakeModeConfig
): WakeDecision {
  if (input.currentTimeMs < input.wakeWindowStartMs) {
    return noTrigger();
  }

  if (input.currentTimeMs >= input.latestWakeTimeMs) {
    return latestFallbackDecision();
  }

  if (currentIndex < 0) {
    return noTrigger();
  }

  const stableStreakDurationMs = getStableStreakDurationMs(scores, currentIndex, input, config);

  if (stableStreakDurationMs >= config.candidateHoldMs) {
    return stableZoneDecision();
  }

  if (
    hasStrongRecentDrop(scores, currentIndex, config.dropThreshold) &&
    hadRecentStableOpportunity(scores, currentIndex, input, config)
  ) {
    return dropProtectionDecision();
  }

  return noTrigger();
}

