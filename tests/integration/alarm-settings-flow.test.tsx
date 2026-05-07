import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "../../src/app/App";

describe("alarm settings flow", () => {
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
      "Monitoring and wake engine are not implemented yet."
    );
  });
});
