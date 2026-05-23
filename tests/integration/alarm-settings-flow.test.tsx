import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import App from "../../src/app/App";
import { STORAGE_KEYS } from "../../src/data/storage/storageKeys";

const notifications = jest.requireMock("expo-notifications") as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
  cancelScheduledNotificationAsync: jest.Mock;
};

describe("alarm settings flow", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    notifications.getPermissionsAsync.mockResolvedValue({
      granted: true,
      status: "granted"
    });
    notifications.requestPermissionsAsync.mockResolvedValue({
      granted: true,
      status: "granted"
    });
    notifications.scheduleNotificationAsync.mockResolvedValue("fallback-notification-id");
    notifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("navigates to the placeholder session shell with selected settings", async () => {
    render(<App />);

    expect(await screen.findByText("Saved locally on this device.")).toBeTruthy();
    expect(screen.getByText("Latest wake-up time")).toBeTruthy();
    expect(screen.getByText("Wake window")).toBeTruthy();
    expect(screen.getByText("Wake mode")).toBeTruthy();
    expect(screen.getByTestId("hour-wheel")).toBeTruthy();
    expect(screen.getByTestId("minute-wheel")).toBeTruthy();

    fireEvent.press(screen.getByTestId("wake-mode-option-comfort"));
    fireEvent.press(screen.getByTestId("wake-window-option-45"));
    fireEvent.press(screen.getByTestId("hour-wheel-option-08"));
    fireEvent.press(screen.getByTestId("minute-wheel-option-05"));
    fireEvent.press(screen.getByTestId("start-session-button"));

    expect(await screen.findByText("Session Shell")).toBeTruthy();
    expect(screen.getByTestId("session-latest-wake-time")).toHaveTextContent("Latest wake-up time: 08:05");
    expect(screen.getByTestId("session-wake-window")).toHaveTextContent("Wake window: 45 min");
    expect(screen.getByTestId("session-wake-mode")).toHaveTextContent("Wake mode: Comfort");
    expect(screen.getByTestId("session-placeholder-message")).toHaveTextContent(
      "This is simulated monitoring only. Real sleep detection and background alarms are not implemented yet."
    );
    await waitFor(() => {
      expect(screen.getByTestId("notification-fallback-status")).toHaveTextContent(
        "Latest-time notification fallback scheduled for 08:05."
      );
    });
    expect(screen.getByTestId("notification-fallback-note")).toHaveTextContent(
      "Smart wake works while the app is active. The notification fallback is only a latest-time reminder."
    );

    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Monitoring");
    expect(screen.getByTestId("session-simulation-time")).toHaveTextContent("Current simulated time: 07:10");
    expect(screen.getByTestId("session-sample-values")).toHaveTextContent(
      "Current sample: motion 0.18, sound 0.22"
    );
    expect(screen.getByTestId("engine-current-mode")).toHaveTextContent("Mode: Comfort");
    expect(screen.getByTestId("engine-trigger-decision")).toHaveTextContent("Engine would trigger: No");

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Wake window active");
    expect(screen.getByTestId("session-wake-window-active")).toHaveTextContent("Wake window: Active");

    fireEvent.press(screen.getByTestId("stop-session-button"));
    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Completed");
    await waitFor(() => {
      expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        "fallback-notification-id"
      );
    });
  });

  it("shows a disabled fallback note when notification permission is denied", async () => {
    notifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      status: "denied"
    });

    render(<App />);

    expect(await screen.findByText("Saved locally on this device.")).toBeTruthy();
    fireEvent.press(screen.getByTestId("start-session-button"));

    expect(await screen.findByTestId("session-status-value")).toHaveTextContent("Monitoring");
    await waitFor(() => {
      expect(screen.getByTestId("notification-fallback-status")).toHaveTextContent(
        "Notification fallback disabled. Foreground smart wake still works while the app is active."
      );
    });
    expect(screen.getByTestId("session-simulation-time")).toHaveTextContent(
      "Current simulated time: 06:20"
    );
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("navigates to the alarm ringing screen when the simulated engine triggers", async () => {
    render(<App />);

    expect(await screen.findByText("Saved locally on this device.")).toBeTruthy();
    fireEvent.press(screen.getByTestId("start-session-button"));
    expect(await screen.findByTestId("session-status-value")).toHaveTextContent("Monitoring");
    await waitFor(() => {
      expect(screen.getByTestId("notification-fallback-status")).toHaveTextContent(
        "Latest-time notification fallback scheduled for 07:00."
      );
    });

    act(() => {
      jest.advanceTimersByTime(41000);
    });

    expect(await screen.findByText("Wake up")).toBeTruthy();
    await waitFor(() => {
      expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        "fallback-notification-id"
      );
    });
    expect(screen.getByTestId("alarm-reason-code")).toHaveTextContent(/stable_zone/);
    expect(screen.getByTestId("alarm-wake-mode")).toHaveTextContent("Wake mode: Balanced");
    expect(screen.getByTestId("alarm-snooze-button")).toHaveTextContent("Snooze (demo 5s)");
  });

  it("continues from ringing to result and saves recent session history", async () => {
    render(<App />);

    expect(await screen.findByText("Saved locally on this device.")).toBeTruthy();
    fireEvent.press(screen.getByTestId("start-session-button"));
    expect(await screen.findByTestId("session-status-value")).toHaveTextContent("Monitoring");
    await waitFor(() => {
      expect(screen.getByTestId("notification-fallback-status")).toHaveTextContent(
        "Latest-time notification fallback scheduled for 07:00."
      );
    });

    act(() => {
      jest.advanceTimersByTime(41000);
    });

    expect(await screen.findByText("Wake up")).toBeTruthy();
    fireEvent.press(screen.getByTestId("alarm-stop-button"));

    expect(await screen.findByText("Session Result")).toBeTruthy();
    expect(screen.getByTestId("result-reason-code")).toHaveTextContent(/stable_zone/);
    expect(screen.getByTestId("result-wake-mode")).toHaveTextContent("Wake mode: Balanced");
    expect(screen.getByTestId("result-wakeability-timeline")).toBeTruthy();

    await waitFor(async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.sessionResultSummaries);

      expect(saved).toContain("stable_zone");
    });
  });

  it("initializes alarm settings from saved local settings", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.alarmSettings,
      JSON.stringify({
        latestWakeTime: { hour: 9, minute: 25 },
        wakeWindowMinutes: 60,
        wakeMode: "fast"
      })
    );

    render(<App />);

    expect(await screen.findByTestId("latest-wake-time-value")).toHaveTextContent("09:25");
    fireEvent.press(screen.getByTestId("start-session-button"));

    expect(await screen.findByTestId("session-latest-wake-time")).toHaveTextContent(
      "Latest wake-up time: 09:25"
    );
    expect(screen.getByTestId("session-wake-window")).toHaveTextContent("Wake window: 60 min");
    expect(screen.getByTestId("session-wake-mode")).toHaveTextContent("Wake mode: Fast");
  });

  it("clears saved settings and recent summaries", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.alarmSettings,
      JSON.stringify({
        latestWakeTime: { hour: 9, minute: 25 },
        wakeWindowMinutes: 60,
        wakeMode: "fast"
      })
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.sessionResultSummaries,
      JSON.stringify([
        {
          id: "recent",
          completedAtMs: 2000,
          triggerTimestampMs: 1000,
          wakeMode: "balanced",
          latestWakeTime: { hour: 7, minute: 0 },
          wakeWindowMinutes: 30,
          reasonCode: "stable_zone"
        }
      ])
    );

    render(<App />);

    expect(await screen.findByTestId("latest-wake-time-value")).toHaveTextContent("09:25");
    expect(screen.getByText(/Stable wake zone/)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("clear-local-data-button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("latest-wake-time-value")).toHaveTextContent("07:00");
      expect(screen.getByTestId("recent-sessions-empty")).toHaveTextContent("No recent sessions yet.");
    });
    await expect(AsyncStorage.getItem(STORAGE_KEYS.alarmSettings)).resolves.toBeNull();
    await expect(AsyncStorage.getItem(STORAGE_KEYS.sessionResultSummaries)).resolves.toBeNull();
  });
});
