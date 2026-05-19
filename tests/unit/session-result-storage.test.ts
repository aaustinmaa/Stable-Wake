import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  clearSessionResultSummaries,
  loadSessionResultSummaries,
  saveSessionResultSummary
} from "../../src/data/storage/sessionResultStorage";
import { STORAGE_KEYS } from "../../src/data/storage/storageKeys";
import type { SessionResultSummary } from "../../src/domain/models/SessionResultSummary";

function summary(id: string, completedAtMs: number): SessionResultSummary {
  return {
    id,
    completedAtMs,
    triggerTimestampMs: completedAtMs - 100,
    wakeMode: "balanced",
    latestWakeTime: { hour: 7, minute: 0 },
    wakeWindowMinutes: 30,
    reasonCode: "stable_zone"
  };
}

describe("session result summary storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and loads summaries newest first", async () => {
    await saveSessionResultSummary(summary("older", 1000));
    await saveSessionResultSummary(summary("newer", 2000));

    await expect(loadSessionResultSummaries()).resolves.toMatchObject([
      { id: "newer" },
      { id: "older" }
    ]);
  });

  it("limits stored summaries to five", async () => {
    for (let index = 0; index < 7; index += 1) {
      await saveSessionResultSummary(summary(`result-${index}`, index));
    }

    const summaries = await loadSessionResultSummaries();

    expect(summaries).toHaveLength(5);
    expect(summaries.map((item) => item.id)).toEqual([
      "result-6",
      "result-5",
      "result-4",
      "result-3",
      "result-2"
    ]);
  });

  it("handles malformed JSON safely", async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.sessionResultSummaries, "{bad json");

    await expect(loadSessionResultSummaries()).resolves.toEqual([]);
  });

  it("clears summaries", async () => {
    await saveSessionResultSummary(summary("saved", 1000));
    await clearSessionResultSummaries();

    await expect(loadSessionResultSummaries()).resolves.toEqual([]);
  });
});
