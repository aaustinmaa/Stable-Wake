import type { WakeScore } from "../models/WakeScore";
import type { WakeModeConfig } from "./wakeEngine.types";

export function hasStrongRecentDrop(
  scores: WakeScore[],
  currentIndex: number,
  dropThreshold: number
): boolean {
  if (currentIndex <= 0) {
    return false;
  }

  const previousScore = scores[currentIndex - 1];
  const currentScore = scores[currentIndex];

  return previousScore.smoothedWakeability - currentScore.smoothedWakeability >= dropThreshold;
}

export function detectStableWakeZone(
  scores: WakeScore[],
  currentIndex: number,
  config: WakeModeConfig,
  isWakeWindowActive: boolean
): boolean {
  if (!isWakeWindowActive || currentIndex < 0) {
    return false;
  }

  const score = scores[currentIndex];

  return (
    score.smoothedWakeability >= config.wakeabilityThreshold &&
    score.stabilityScore >= config.stabilityThreshold &&
    !hasStrongRecentDrop(scores, currentIndex, config.dropThreshold)
  );
}

