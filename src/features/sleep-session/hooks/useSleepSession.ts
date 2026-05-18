import { useEffect, useMemo, useRef, useState } from "react";

import type { AlarmSettings } from "../../../domain/models/AlarmSettings";
import type { ClockTime } from "../../../domain/models/ClockTime";
import type { SessionStatus } from "../../../domain/models/SessionStatus";
import type { SleepSample } from "../../../domain/models/SleepSample";
import {
  createSimulatedSessionPlan,
  createSimulatedSleepStream,
  isWakeWindowActive
} from "../../../services/simulation/createSimulatedSleepStream";
import { addMinutesToClockTime } from "../../../shared/utils/time";

type SimulatedSleepStream = ReturnType<typeof createSimulatedSleepStream>;

export function useSleepSession(settings: AlarmSettings) {
  const [status, setStatus] = useState<SessionStatus>("configured");
  const [currentSample, setCurrentSample] = useState<SleepSample | null>(null);
  const streamRef = useRef<SimulatedSleepStream | null>(null);
  const plan = useMemo(() => createSimulatedSessionPlan(settings), [settings]);

  useEffect(() => {
    return () => {
      streamRef.current?.stop();
    };
  }, []);

  const startSimulation = () => {
    streamRef.current?.stop();
    setCurrentSample(null);
    setStatus("monitoring");

    const stream = createSimulatedSleepStream({
      settings,
      onSample: (sample) => {
        setCurrentSample(sample);
        setStatus(isWakeWindowActive(sample.simulatedMinute) ? "wake_window_active" : "monitoring");
      },
      onComplete: () => {
        setStatus("completed");
      }
    });

    streamRef.current = stream;
    stream.start();
  };

  const stopSession = () => {
    streamRef.current?.stop();
    streamRef.current = null;
    setStatus("completed");
  };

  const currentClockTime: ClockTime | null = currentSample
    ? addMinutesToClockTime(plan.startClockTime, currentSample.simulatedMinute)
    : null;

  return {
    status,
    currentSample,
    currentClockTime,
    plan,
    isWakeWindowActive: currentSample ? isWakeWindowActive(currentSample.simulatedMinute) : false,
    startSimulation,
    stopSession
  };
}
