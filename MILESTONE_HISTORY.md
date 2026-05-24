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

## Milestone 6: Foreground Alarm Experience
Implemented:
- `AlarmRingingScreen` between session trigger and result.
- Foreground-only alarm audio using `expo-audio` and a local bundled `alarm-sound.mp3` asset.
- Vibration while ringing.
- Stop action that cleans up alarm behavior and replaces into `ResultScreen`.
- Clearly labeled demo snooze behavior that stops audio/vibration and rings again after 5 seconds.
- Keep-awake during active session and ringing screens.
- Safe audio/vibration cleanup on Stop, Snooze, unmount, and leaving the ringing screen.
- Navigation update to `AlarmSettings -> SleepSession -> AlarmRinging -> Result`.
- Ringing screen tests with mocked audio, vibration, and keep-awake.
- Result wakeability timeline layout fix so bars stay within the card.

Important decisions:
- Milestone 6 remains foreground-only.
- No background execution, notifications, system alarms, real sensors, backend, auth, cloud sync, or wake-engine changes were added.
- Snooze is a demo foreground behavior, not recurring alarm scheduling.
- The same `SessionResult` flows from session trigger through ringing into result storage/display.

## Milestone 7: Local Notification Fallback
Implemented:
- `expo-notifications` dependency and config plugin.
- Notification service boundary under `src/services/notifications`.
- Next occurrence calculation for `ClockTime` using local wall-clock time.
- Notification permission request flow at session start.
- One-shot latest-wake-time local notification fallback.
- Android notification channel setup.
- Session UI status for scheduled, disabled, cancelled, or failed fallback notification state.
- Cancellation of scheduled fallback notification on early foreground trigger and session stop.
- Defensive fallback cancellation on alarm Stop.
- Unit tests for notification scheduling, denial, cancellation, Android channel setup, errors, and time calculation.
- Integration tests for scheduling, denied permissions, early trigger cancellation, stop cancellation, and existing session flow.

Important decisions:
- Milestone 7 is a latest-time safety net only.
- Notification fallback uses real device wall-clock time, not accelerated simulation time.
- No background wake engine, background task, push notifications, backend, sensors, auth, recurrence, or notification-tap navigation were added.
- Default notification sound is used; custom notification sound remains future work.

## Milestone 7.1: Pause Simulation While App Is Inactive
Implemented:
- React Native `AppState` handling in the simulation stream.
- Active-time accumulation for the accelerated simulation clock.
- Pause behavior when AppState becomes inactive/backgrounded.
- Resume behavior from previous simulated elapsed time when AppState becomes active.
- Cleanup of AppState listeners and timers on stream stop/unmount.
- Tests for active ticking, inactive/background pause, active resume, and avoiding background-time latest fallback.

Important decisions:
- Notification fallback behavior was not changed and still uses real wall-clock latest wake time.
- Wake engine logic, stable wake trigger logic, simulation sample pattern, storage behavior, foreground alarm audio/vibration, and notification scheduling rules were not changed.

## Post-Milestone Bugfixes
Implemented:
- Expo SDK upgraded to SDK 54 for current Expo Go compatibility.
- Simulation auto-starts on session mount.
- Simulation uses accelerated time: 1 active real second = 1 simulated minute.
- Default simulation now includes a deterministic stable wakeable segment so early stable-zone triggers are observable.
- Session result delivery guards against repeated navigation.
