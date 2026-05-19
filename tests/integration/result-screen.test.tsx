import { render, screen, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadSessionResultSummaries } from "../../src/data/storage/sessionResultStorage";
import type { RootStackParamList } from "../../src/app/navigation/routeTypes";
import type { SessionResult } from "../../src/domain/models/SessionResult";
import { ResultScreen } from "../../src/features/results/screens/ResultScreen";

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
      timestampMs: 10 * 60000,
      rawWakeability: 0.62,
      smoothedWakeability: 0.62,
      stabilityScore: 0.5,
      timingPressure: 0
    },
    {
      timestampMs: 15 * 60000,
      rawWakeability: 0.7,
      smoothedWakeability: 0.66,
      stabilityScore: 1,
      timingPressure: 0.17
    },
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

describe("ResultScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("renders result summary, explanations, reason code, and timeline", () => {
    render(
      <ResultScreen
        navigation={{} as never}
        route={{ key: "Result", name: "Result", params: { result } } as RootStackParamList["Result"] & never}
      />
    );

    expect(screen.getByText("Session Result")).toBeTruthy();
    expect(screen.getByTestId("result-trigger-time")).toHaveTextContent("20 min into simulation");
    expect(screen.getByTestId("result-reason-code")).toHaveTextContent(/stable_zone/);
    expect(screen.getByTestId("result-wake-mode")).toHaveTextContent("Wake mode: Balanced");
    expect(screen.getByTestId("result-latest-wake-time")).toHaveTextContent("Latest wake time: 07:00");
    expect(screen.getByTestId("result-wake-window")).toHaveTextContent("Wake window: 30 min");
    expect(screen.getByTestId("result-explanation-title-stable_wake_zone_sustained")).toHaveTextContent(
      "Stable wake zone sustained"
    );
    expect(screen.getByTestId("result-wakeability-timeline")).toBeTruthy();
    expect(screen.getByTestId("timeline-bar-1200000")).toBeTruthy();
  });

  it("saves a recent result summary", async () => {
    render(
      <ResultScreen
        navigation={{} as never}
        route={{ key: "Result", name: "Result", params: { result } } as RootStackParamList["Result"] & never}
      />
    );

    await waitFor(async () => {
      await expect(loadSessionResultSummaries()).resolves.toMatchObject([
        {
          triggerTimestampMs: result.triggerTimestampMs,
          wakeMode: "balanced",
          reasonCode: "stable_zone"
        }
      ]);
    });
  });
});
