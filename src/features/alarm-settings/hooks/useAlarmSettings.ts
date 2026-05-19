import { useEffect, useRef, useState } from "react";

import { loadAlarmSettings, saveAlarmSettings } from "../../../data/storage/alarmSettingsStorage";
import type { AlarmSettings } from "../../../domain/models/AlarmSettings";
import type { ClockTime } from "../../../domain/models/ClockTime";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { DEFAULT_ALARM_SETTINGS } from "../../../shared/constants/defaults";

export function useAlarmSettings() {
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_ALARM_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const suppressSavingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    loadAlarmSettings().then((loadedSettings) => {
      if (!isMounted) {
        return;
      }

      setSettings(loadedSettings);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (suppressSavingRef.current) {
      return;
    }

    saveAlarmSettings(settings);
  }, [isLoaded, settings]);

  const setLatestWakeTime = (latestWakeTime: ClockTime) => {
    suppressSavingRef.current = false;
    setSettings((current) => ({ ...current, latestWakeTime }));
  };

  const setWakeWindowMinutes = (wakeWindowMinutes: number) => {
    suppressSavingRef.current = false;
    setSettings((current) => ({ ...current, wakeWindowMinutes }));
  };

  const setWakeMode = (wakeMode: WakeMode) => {
    suppressSavingRef.current = false;
    setSettings((current) => ({ ...current, wakeMode }));
  };

  const resetToDefaultsWithoutSaving = () => {
    suppressSavingRef.current = true;
    setSettings(DEFAULT_ALARM_SETTINGS);
  };

  return {
    isLoaded,
    settings,
    setLatestWakeTime,
    setWakeWindowMinutes,
    setWakeMode,
    resetToDefaultsWithoutSaving
  };
}
