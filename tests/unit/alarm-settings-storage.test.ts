import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  clearAlarmSettings,
  loadAlarmSettings,
  saveAlarmSettings
} from "../../src/data/storage/alarmSettingsStorage";
import { STORAGE_KEYS } from "../../src/data/storage/storageKeys";
import type { AlarmSettings } from "../../src/domain/models/AlarmSettings";
import { DEFAULT_ALARM_SETTINGS } from "../../src/shared/constants/defaults";

const settings: AlarmSettings = {
  latestWakeTime: { hour: 8, minute: 5 },
  wakeWindowMinutes: 45,
  wakeMode: "comfort"
};

describe("alarm settings storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and loads settings", async () => {
    await saveAlarmSettings(settings);

    await expect(loadAlarmSettings()).resolves.toEqual(settings);
  });

  it("falls back to defaults when storage is empty", async () => {
    await expect(loadAlarmSettings()).resolves.toEqual(DEFAULT_ALARM_SETTINGS);
  });

  it("falls back to defaults for malformed JSON", async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.alarmSettings, "{bad json");

    await expect(loadAlarmSettings()).resolves.toEqual(DEFAULT_ALARM_SETTINGS);
  });

  it("falls back to defaults for invalid settings shape", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.alarmSettings,
      JSON.stringify({ latestWakeTime: { hour: 99, minute: 0 }, wakeWindowMinutes: 30, wakeMode: "balanced" })
    );

    await expect(loadAlarmSettings()).resolves.toEqual(DEFAULT_ALARM_SETTINGS);
  });

  it("clears saved settings", async () => {
    await saveAlarmSettings(settings);
    await clearAlarmSettings();

    await expect(AsyncStorage.getItem(STORAGE_KEYS.alarmSettings)).resolves.toBeNull();
  });
});

