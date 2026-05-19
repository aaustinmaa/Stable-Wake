import type { SleepSample } from "../models/SleepSample";
import type { WakeMode } from "../models/WakeMode";
import type { WakeDecision } from "../models/WakeDecision";
import type { WakeScore } from "../models/WakeScore";

export const MS_PER_MINUTE = 60 * 1000;

export type WakeModeConfig = {
  wakeabilityThreshold: number;
  stabilityThreshold: number;
  stabilityWindowSize: number;
  smoothingWindowSize: number;
  candidateHoldMs: number;
  dropThreshold: number;
};

export type WakeEngineInput = {
  samples: SleepSample[];
  currentTimeMs: number;
  wakeWindowStartMs: number;
  latestWakeTimeMs: number;
  wakeMode: WakeMode;
};

export type WakeEngineOutput = {
  score: WakeScore | null;
  wakeScores: WakeScore[];
  decision: WakeDecision;
  stableWakeZoneActive: boolean;
};

export const WAKE_MODE_CONFIGS: Record<WakeMode, WakeModeConfig> = {
  fast: {
    wakeabilityThreshold: 0.52,
    stabilityThreshold: 0.5,
    stabilityWindowSize: 3,
    smoothingWindowSize: 3,
    candidateHoldMs: 5 * MS_PER_MINUTE,
    dropThreshold: 0.14
  },
  balanced: {
    wakeabilityThreshold: 0.58,
    stabilityThreshold: 0.67,
    stabilityWindowSize: 3,
    smoothingWindowSize: 3,
    candidateHoldMs: 10 * MS_PER_MINUTE,
    dropThreshold: 0.14
  },
  comfort: {
    wakeabilityThreshold: 0.64,
    stabilityThreshold: 0.75,
    stabilityWindowSize: 4,
    smoothingWindowSize: 3,
    candidateHoldMs: 15 * MS_PER_MINUTE,
    dropThreshold: 0.14
  }
};
