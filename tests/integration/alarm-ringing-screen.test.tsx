import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Vibration } from "react-native";

import type { RootStackParamList } from "../../src/app/navigation/routeTypes";
import type { SessionResult } from "../../src/domain/models/SessionResult";
import { AlarmRingingScreen } from "../../src/features/alarm-ringing/screens/AlarmRingingScreen";

const audio = jest.requireMock("expo-audio") as {
  __mockAudioPlayer: {
    play: jest.Mock;
    pause: jest.Mock;
    seekTo: jest.Mock;
  };
  setAudioModeAsync: jest.Mock;
};
const notifications = jest.requireMock("expo-notifications") as {
  cancelScheduledNotificationAsync: jest.Mock;
};

const result: SessionResult = {
  triggerTimestampMs: 20 * 60000,
  wakeMode: "balanced",
  latestWakeTime: { hour: 7, minute: 0 },
  wakeWindowMinutes: 30,
  reasonCode: "stable_zone",
  explanationItems: [
    {
      code: "stable_wake_zone_sustained",
      title: "Stable wake zone sustained",
      description: "Wakeability stayed high and stable long enough for the selected wake mode."
    }
  ],
  wakeScores: [
    {
      timestampMs: 20 * 60000,
      rawWakeability: 0.74,
      smoothedWakeability: 0.69,
      stabilityScore: 1,
      timingPressure: 0.33
    }
  ],
  selectedSettings: {
    latestWakeTime: { hour: 7, minute: 0 },
    wakeWindowMinutes: 30,
    wakeMode: "balanced"
  }
};

function renderAlarmRinging() {
  const navigation = {
    addListener: jest.fn(() => jest.fn()),
    replace: jest.fn()
  };

  const view = render(
    <AlarmRingingScreen
      navigation={navigation as never}
      route={
        {
          key: "AlarmRinging",
          name: "AlarmRinging",
          params: { result, fallbackNotificationId: "fallback-notification-id" }
        } as RootStackParamList["AlarmRinging"] & never
      }
    />
  );

  return {
    ...view,
    navigation
  };
}

describe("AlarmRingingScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders trigger reason, mode, selected settings, and demo snooze label", async () => {
    renderAlarmRinging();

    await waitFor(() => {
      expect(audio.__mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("Wake up")).toBeTruthy();
    expect(screen.getByTestId("alarm-trigger-time")).toHaveTextContent("20 min into simulation");
    expect(screen.getByTestId("alarm-reason-code")).toHaveTextContent(
      "Trigger reason: Stable wake zone (stable_zone)"
    );
    expect(screen.getByTestId("alarm-wake-mode")).toHaveTextContent("Wake mode: Balanced");
    expect(screen.getByTestId("alarm-latest-wake-time")).toHaveTextContent(
      "Latest wake time: 07:00"
    );
    expect(screen.getByTestId("alarm-wake-window")).toHaveTextContent("Wake window: 30 min");
    expect(screen.getByTestId("alarm-snooze-button")).toHaveTextContent("Snooze (demo 5s)");
    expect(screen.getByTestId("alarm-prototype-note")).toHaveTextContent(
      "Foreground prototype alarm. Background alarm support is planned for a later milestone."
    );
  });

  it("starts foreground alarm behavior on mount and cleans up on stop", async () => {
    const { navigation } = renderAlarmRinging();

    await waitFor(() => {
      expect(audio.__mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    });
    expect(audio.setAudioModeAsync).toHaveBeenCalledWith({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix"
    });
    expect(screen.getByTestId("alarm-audio-status")).toHaveTextContent("Audio: playing");
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 700, 500], true);

    fireEvent.press(screen.getByTestId("alarm-stop-button"));

    expect(audio.__mockAudioPlayer.pause).toHaveBeenCalled();
    expect(audio.__mockAudioPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(Vibration.cancel).toHaveBeenCalled();
    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "fallback-notification-id"
    );
    expect(navigation.replace).toHaveBeenCalledWith("Result", { result });
  });

  it("snoozes with a clear demo state and rings again after five seconds", async () => {
    renderAlarmRinging();

    await waitFor(() => {
      expect(audio.__mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(screen.getByTestId("alarm-snooze-button"));

    expect(screen.getByTestId("alarm-ringing-state")).toHaveTextContent("Snoozing");
    expect(screen.getByTestId("alarm-snooze-status")).toHaveTextContent(
      "The foreground alarm will ring again in 5 seconds."
    );
    expect(audio.__mockAudioPlayer.pause).toHaveBeenCalled();
    expect(Vibration.cancel).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("alarm-ringing-state")).toHaveTextContent("Alarm ringing");
    await waitFor(() => {
      expect(audio.__mockAudioPlayer.play).toHaveBeenCalledTimes(2);
    });
  });

  it("cleans up audio and vibration on unmount", async () => {
    const { unmount } = renderAlarmRinging();

    await waitFor(() => {
      expect(audio.__mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    });
    unmount();

    expect(audio.__mockAudioPlayer.pause).toHaveBeenCalled();
    expect(audio.__mockAudioPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(Vibration.cancel).toHaveBeenCalled();
  });
});
