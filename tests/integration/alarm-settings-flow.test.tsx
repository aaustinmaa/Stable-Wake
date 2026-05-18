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

    fireEvent.press(screen.getByTestId("wake-mode-option-comfort"));
    fireEvent.press(screen.getByTestId("wake-window-option-45"));
    fireEvent.press(screen.getByTestId("latest-wake-time-increment"));
    fireEvent.press(screen.getByTestId("start-session-button"));

    expect(await screen.findByText("Session Shell")).toBeTruthy();
    expect(screen.getByTestId("session-latest-wake-time")).toHaveTextContent("Latest wake-up time: 07:15");
    expect(screen.getByTestId("session-wake-window")).toHaveTextContent("Wake window: 45 min");
    expect(screen.getByTestId("session-wake-mode")).toHaveTextContent("Wake mode: Comfort");
    expect(screen.getByTestId("session-placeholder-message")).toHaveTextContent(
      "Monitoring and wake engine are not implemented yet. This is simulated monitoring only."
    );
    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Configured");

    fireEvent.press(screen.getByTestId("start-simulation-button"));

    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Monitoring");
    expect(screen.getByTestId("session-simulation-time")).toHaveTextContent("Current simulated time: 06:20");
    expect(screen.getByTestId("session-sample-values")).toHaveTextContent(
      "Current sample: motion 0.18, sound 0.36"
    );

    act(() => {
      jest.advanceTimersByTime(1400);
    });

    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Wake window active");
    expect(screen.getByTestId("session-wake-window-active")).toHaveTextContent("Wake window: Active");

    fireEvent.press(screen.getByTestId("stop-session-button"));
    expect(screen.getByTestId("session-status-value")).toHaveTextContent("Completed");
  });
});
