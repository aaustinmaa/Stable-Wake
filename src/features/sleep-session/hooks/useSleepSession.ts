import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AlarmSettings } from "../../../domain/models/AlarmSettings";
import type { ClockTime } from "../../../domain/models/ClockTime";
import type { SessionResult } from "../../../domain/models/SessionResult";
import type { SessionStatus } from "../../../domain/models/SessionStatus";
import type { SleepSample } from "../../../domain/models/SleepSample";
import { evaluateWakeEngine } from "../../../domain/wake-engine/wakeEngine";
import { MS_PER_MINUTE } from "../../../domain/wake-engine/wakeEngine.types";
import {
  createSimulatedSessionPlan,
  createSimulatedSleepStream,
  getSimulatedMinute,
  isWakeWindowActive
} from "../../../services/simulation/createSimulatedSleepStream";
import { addMinutesToClockTime } from "../../../shared/utils/time";

type SimulatedSleepStream = ReturnType<typeof createSimulatedSleepStream>;

type UseSleepSessionOptions = {
  onResult?: (result: SessionResult) => void;
};

export function useSleepSession(settings: AlarmSettings, options: UseSleepSessionOptions = {}) {
  const { onResult } = options;
  const [status, setStatus] = useState<SessionStatus>("configured");
  const [currentSample, setCurrentSample] = useState<SleepSample | null>(null);
  const [samples, setSamples] = useState<SleepSample[]>([]);
  const streamRef = useRef<SimulatedSleepStream | null>(null);
  const samplesRef = useRef<SleepSample[]>([]);
  const hasDeliveredResultRef = useRef(false);
  const onResultRef = useRef(onResult);
  const plan = useMemo(() => createSimulatedSessionPlan(settings), [settings]);
  const wakeWindowStartMs = 10 * MS_PER_MINUTE;
  const latestWakeTimeMs = wakeWindowStartMs + settings.wakeWindowMinutes * MS_PER_MINUTE;
  const latestSample = samples[samples.length - 1] ?? null;
  const engineOutput = useMemo(() => {
    const currentTimeMs = latestSample?.timestampMs ?? 0;

    return evaluateWakeEngine({
      samples,
      currentTimeMs,
      wakeWindowStartMs,
      latestWakeTimeMs,
      wakeMode: settings.wakeMode
    });
  }, [latestSample, latestWakeTimeMs, samples, settings.wakeMode, wakeWindowStartMs]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const startSimulation = useCallback(() => {
    streamRef.current?.stop();
    hasDeliveredResultRef.current = false;
    setCurrentSample(null);
    samplesRef.current = [];
    setSamples([]);
    setStatus("monitoring");

    const stream = createSimulatedSleepStream({
      settings,
      onSample: (sample) => {
        const simulatedMinute = getSimulatedMinute(sample);
        const nextSamples = [...samplesRef.current, sample];
        const nextEngineOutput = evaluateWakeEngine({
          samples: nextSamples,
          currentTimeMs: sample.timestampMs,
          wakeWindowStartMs,
          latestWakeTimeMs,
          wakeMode: settings.wakeMode
        });
        const reasonCode = nextEngineOutput.decision.reasonCode;

        samplesRef.current = nextSamples;
        setCurrentSample(sample);
        setSamples(nextSamples);
        setStatus(isWakeWindowActive(simulatedMinute) ? "wake_window_active" : "monitoring");

        if (
          nextEngineOutput.decision.shouldTrigger &&
          reasonCode !== null &&
          !hasDeliveredResultRef.current
        ) {
          hasDeliveredResultRef.current = true;
          streamRef.current?.stop();
          streamRef.current = null;
          setStatus("completed");
          onResultRef.current?.({
            triggerTimestampMs: sample.timestampMs,
            wakeMode: settings.wakeMode,
            latestWakeTime: settings.latestWakeTime,
            wakeWindowMinutes: settings.wakeWindowMinutes,
            reasonCode,
            explanationItems: nextEngineOutput.decision.explanationItems,
            wakeScores: nextEngineOutput.wakeScores,
            selectedSettings: settings
          });
        }
      },
      onComplete: () => {
        setStatus("completed");
      }
    });

    streamRef.current = stream;
    stream.start();
  }, [latestWakeTimeMs, settings, wakeWindowStartMs]);

  useEffect(() => {
    startSimulation();

    return () => {
      streamRef.current?.stop();
    };
  }, [startSimulation]);

  const stopSession = useCallback(() => {
    streamRef.current?.stop();
    streamRef.current = null;
    setStatus("completed");
  }, []);

  const currentClockTime: ClockTime | null = currentSample
    ? addMinutesToClockTime(plan.startClockTime, getSimulatedMinute(currentSample))
    : null;

  return {
    status,
    currentSample,
    currentClockTime,
    plan,
    elapsedSimulatedMinutes: currentSample ? getSimulatedMinute(currentSample) : 0,
    engineOutput,
    isWakeWindowActive: currentSample ? isWakeWindowActive(getSimulatedMinute(currentSample)) : false,
    startSimulation,
    stopSession
  };
}
