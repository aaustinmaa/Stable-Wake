import { Platform } from "react-native";

import {
  cancelFallbackNotification,
  getNextClockTimeOccurrence,
  scheduleLatestWakeFallback
} from "../../src/services/notifications/notificationService";
import type { AlarmSettings } from "../../src/domain/models/AlarmSettings";

const notifications = jest.requireMock("expo-notifications") as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  setNotificationChannelAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
  cancelScheduledNotificationAsync: jest.Mock;
};

const settings: AlarmSettings = {
  latestWakeTime: { hour: 7, minute: 0 },
  wakeWindowMinutes: 30,
  wakeMode: "balanced"
};

function setPlatformOS(os: "ios" | "android") {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os
  });
}

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatformOS("ios");
    notifications.getPermissionsAsync.mockResolvedValue({
      granted: true,
      status: "granted"
    });
    notifications.requestPermissionsAsync.mockResolvedValue({
      granted: true,
      status: "granted"
    });
    notifications.setNotificationChannelAsync.mockResolvedValue(null);
    notifications.scheduleNotificationAsync.mockResolvedValue("scheduled-id");
    notifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    setPlatformOS("ios");
  });

  it("calculates next occurrence later today", () => {
    const next = getNextClockTimeOccurrence(
      { hour: 7, minute: 0 },
      new Date(2026, 4, 22, 6, 30, 0)
    );

    expect(next).toEqual(new Date(2026, 4, 22, 7, 0, 0, 0));
  });

  it("calculates tomorrow when the selected time already passed", () => {
    const next = getNextClockTimeOccurrence(
      { hour: 7, minute: 0 },
      new Date(2026, 4, 22, 8, 0, 0)
    );

    expect(next).toEqual(new Date(2026, 4, 23, 7, 0, 0, 0));
  });

  it("calculates tomorrow when the selected time equals the current minute", () => {
    const next = getNextClockTimeOccurrence(
      { hour: 7, minute: 0 },
      new Date(2026, 4, 22, 7, 0, 0)
    );

    expect(next).toEqual(new Date(2026, 4, 23, 7, 0, 0, 0));
  });

  it("handles near-midnight next occurrence", () => {
    const next = getNextClockTimeOccurrence(
      { hour: 0, minute: 5 },
      new Date(2026, 4, 22, 23, 58, 0)
    );

    expect(next).toEqual(new Date(2026, 4, 23, 0, 5, 0, 0));
  });

  it("schedules a latest wake fallback notification with honest content", async () => {
    const scheduledFor = new Date(2026, 4, 22, 7, 0, 0, 0);
    const result = await scheduleLatestWakeFallback(
      settings,
      new Date(2026, 4, 22, 6, 30, 0)
    );

    expect(result).toEqual({
      status: "scheduled",
      permission: "granted",
      notification: {
        identifier: "scheduled-id",
        scheduledFor
      }
    });
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "StableWake fallback alarm",
        body: "Latest wake time reached.",
        data: { kind: "latestWakeFallback" },
        sound: "default"
      },
      trigger: {
        type: "date",
        date: scheduledFor,
        channelId: "stablewake-fallback"
      }
    });
  });

  it("does not schedule when permission is denied", async () => {
    notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      status: "denied"
    });

    await expect(scheduleLatestWakeFallback(settings)).resolves.toMatchObject({
      status: "disabled",
      permission: "denied",
      notification: null
    });
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("sets an Android notification channel before scheduling", async () => {
    setPlatformOS("android");

    await scheduleLatestWakeFallback(settings);

    expect(notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "stablewake-fallback",
      {
        name: "StableWake fallback",
        importance: 6,
        sound: "default",
        vibrationPattern: [0, 500, 250, 500]
      }
    );
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it("cancels a scheduled fallback notification", async () => {
    await cancelFallbackNotification("scheduled-id");

    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("scheduled-id");
  });

  it("does nothing when asked to cancel without an identifier", async () => {
    await cancelFallbackNotification(null);

    expect(notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  it("returns an error result when scheduling fails", async () => {
    notifications.scheduleNotificationAsync.mockRejectedValue(new Error("native scheduling failed"));

    await expect(scheduleLatestWakeFallback(settings)).resolves.toMatchObject({
      status: "error",
      permission: "unknown",
      notification: null,
      errorMessage: "native scheduling failed"
    });
  });
});
