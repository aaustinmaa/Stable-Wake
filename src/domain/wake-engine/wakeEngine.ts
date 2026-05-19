import type { WakeDecision } from "../models/WakeDecision";
import type { WakeScore } from "../models/WakeScore";
import { computeRawWakeability } from "./computeRawWakeability";
import { computeStability } from "./computeStability";
import { computeTimingPressure } from "./computeTimingPressure";
import { decideWakeTrigger } from "./decideWakeTrigger";
import { detectStableWakeZone } from "./detectStableWakeZone";
import { smoothWakeability } from "./smoothWakeability";
import type { WakeEngineInput, WakeEngineOutput } from "./wakeEngine.types";
import { WAKE_MODE_CONFIGS } from "./wakeEngine.types";

const EMPTY_DECISION: WakeDecision = {
  shouldTrigger: false,
  reasonCode: null,
  explanationItems: []
};

export function evaluateWakeEngine(input: WakeEngineInput): WakeEngineOutput {
  const config = WAKE_MODE_CONFIGS[input.wakeMode];
  const samples = input.samples
    .filter((sample) => sample.timestampMs <= input.currentTimeMs)
    .sort((left, right) => left.timestampMs - right.timestampMs);

  if (samples.length === 0) {
    return {
      score: null,
      wakeScores: [],
      stableWakeZoneActive: false,
      decision:
        input.currentTimeMs >= input.latestWakeTimeMs
          ? {
              shouldTrigger: true,
              reasonCode: "latest_fallback",
              explanationItems: [
                {
                  code: "latest_wake_time_reached",
                  title: "Latest wake time reached",
                  description:
                    "The session reached the latest selected wake time, so the alarm should trigger now."
                }
              ]
            }
          : EMPTY_DECISION
    };
  }

  const rawWakeabilities = samples.map(computeRawWakeability);
  const smoothedWakeabilities = smoothWakeability(rawWakeabilities, config.smoothingWindowSize);
  const scores: WakeScore[] = samples.map((sample, index) => ({
    timestampMs: sample.timestampMs,
    rawWakeability: Number(rawWakeabilities[index].toFixed(4)),
    smoothedWakeability: smoothedWakeabilities[index],
    stabilityScore: computeStability(
      smoothedWakeabilities,
      index,
      config.wakeabilityThreshold,
      config.stabilityWindowSize
    ),
    timingPressure: computeTimingPressure(
      sample.timestampMs,
      input.wakeWindowStartMs,
      input.latestWakeTimeMs
    )
  }));
  const currentIndex = scores.length - 1;
  const currentScore = scores[currentIndex];
  const isWakeWindowActive =
    input.currentTimeMs >= input.wakeWindowStartMs && input.currentTimeMs < input.latestWakeTimeMs;
  const stableWakeZoneActive = detectStableWakeZone(scores, currentIndex, config, isWakeWindowActive);

  return {
    score: currentScore,
    wakeScores: scores,
    stableWakeZoneActive,
    decision: decideWakeTrigger(scores, currentIndex, input, config)
  };
}
