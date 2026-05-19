import { act, fireEvent, render, screen } from "@testing-library/react-native";

import App from "../../src/app/App";

describe("alarm settings flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("navigates to the placeholder session shell with selected settings", async () => {
    render(<App />);

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
      "This is simulated monitoring only. Real sleep detection and alarm audio are not implemented yet."
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
  });

  it("navigates to the result screen when the simulated engine triggers", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("start-session-button"));
    expect(await screen.findByTestId("session-status-value")).toHaveTextContent("Monitoring");

    act(() => {
      jest.advanceTimersByTime(41000);
    });

    expect(await screen.findByText("Session Result")).toBeTruthy();
    expect(screen.getByTestId("result-reason-code")).toHaveTextContent(/stable_zone/);
    expect(screen.getByTestId("result-wake-mode")).toHaveTextContent("Wake mode: Balanced");
    expect(screen.getByTestId("result-wakeability-timeline")).toBeTruthy();
  });
});
