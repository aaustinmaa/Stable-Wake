import { DEFAULT_ALARM_SETTINGS, WAKE_WINDOW_PRESETS } from "../../src/shared/constants/defaults";

describe("alarm settings defaults", () => {
  it("exports the expected default settings", () => {
    expect(DEFAULT_ALARM_SETTINGS).toEqual({
      latestWakeTime: { hour: 7, minute: 0 },
      wakeWindowMinutes: 30,
      wakeMode: "balanced"
    });
  });

  it("uses lowercase wake mode values and supported presets", () => {
    expect(["fast", "balanced", "comfort"]).toContain(DEFAULT_ALARM_SETTINGS.wakeMode);
    expect(WAKE_WINDOW_PRESETS).toEqual([15, 30, 45, 60]);
  });
});
