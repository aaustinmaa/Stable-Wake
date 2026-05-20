# MILESTONE_HISTORY.md

## Milestone 1: App Skeleton And Alarm Settings
Implemented:
- Expo React Native TypeScript project scaffold.
- React Navigation native stack.
- `AlarmSettings`, `WakeMode`, and `ClockTime`.
- Alarm settings screen with latest wake time, wake window, and wake mode.
- Placeholder sleep session route.
- Initial unit and integration tests.

Important decisions:
- Wake mode domain values are lowercase: `"fast" | "balanced" | "comfort"`.
- Latest wake time uses `ClockTime`, not Date or DateTime.
- No persistence, Zustand, simulation, wake engine, or result screen yet.

## Milestone 2: Session Coordination And Simulation Shell
Implemented:
- `SleepSample` and `SessionStatus`.
- `useSleepSession` hook.
- Deterministic simulation stream.
- Session screen displaying selected settings, status, simulated time, sample values, and wake window state.
- Manual stop behavior.

Important decisions:
- Simulation lives under `src/services/simulation`.
- Session coordination lives in `src/features/sleep-session/hooks`.
- UI does not own stream interval logic.

## Milestone 3: Wake Engine V1
Implemented:
- Pure wake engine modules under `src/domain/wake-engine`.
- `WakeScore`, `WakeDecision`, and `ExplanationItem`.
- Raw wakeability, smoothing, stability, timing pressure, stable wake zone detection, trigger decision.
- Fast, balanced, and comfort mode configs.
- Session debug output for wakeability, stability, timing pressure, stable-zone status, trigger decision, and reason.
- Focused wake engine unit tests.

Important decisions:
- Wake engine remains pure and deterministic.
- No UI dependencies in wake engine.
- No ResultScreen, charts, persistence, sensors, notifications, or alarm audio.

## Milestone 4: Result Explanation Flow
Implemented:
- `SessionResult`.
- `ResultScreen`.
- `WakeSummaryCard`, `ExplanationList`, and `WakeabilityTimeline`.
- Session-to-result navigation when the engine first triggers.
- Result rendering tests and navigation flow tests.

Important decisions:
- Explanation text comes from engine decision output.
- Timeline is a small custom view, not a chart library.
- Result language remains honest and non-medical.

## Milestone 4.5: UI/UX Bugfix Pass
Implemented:
- Sleep session screen scroll/bounce fix with `SafeAreaView` and `ScrollView`.
- Result screen scrollable safe-area layout.
- Alarm settings time picker replaced with two vertical wheels for hour and minute.
- Light visual cleanup using a tiny shared theme.
- Tests updated for wheel picker interaction and selected `ClockTime` flow.

Important decisions:
- No core logic changes.
- No wake engine behavior changes.
- No simulation behavior changes.
- No design system or heavy UI library.

## Milestone 5: Local Persistence And Recent Session History
Implemented:
- AsyncStorage dependency.
- Versioned local storage keys.
- Alarm settings load/save/clear adapter.
- Recent session result summary load/save/clear adapter.
- `SessionResultSummary` domain model.
- Result-to-summary mapping utility.
- Alarm settings restore on app/screen start.
- Automatic save when user changes settings.
- Recent simulated sessions section on settings screen.
- Clear saved data action.
- Result screen saves lightweight recent summaries.
- Storage and persistence behavior tests.

Important decisions:
- Storage adapters stay under `src/data/storage`.
- No Zustand or complex state management.
- Invalid or malformed storage falls back safely.
- Recent summaries are capped at 5 and newest-first.
- Full `wakeScores` arrays are not persisted.
- No backend, auth, cloud sync, notifications, alarm audio, or real sensors.

## Post-Milestone Bugfixes
Implemented:
- Expo SDK upgraded to SDK 54 for current Expo Go compatibility.
- Simulation auto-starts on session mount.
- Simulation uses accelerated time: 1 real second = 1 simulated minute.
- Default simulation now includes a deterministic stable wakeable segment so early stable-zone triggers are observable.
- Session result delivery guards against repeated navigation.

