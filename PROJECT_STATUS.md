# PROJECT_STATUS.md

## Current State
StableWake is a local-first Expo React Native prototype with milestones 1, 2, 3, 4, 4.5, 5, 6, 7, and 7.1 completed.

The app currently supports:
- Alarm settings with latest wake time, wake window, and wake mode.
- Local persistence for alarm settings.
- A small recent simulated session history saved locally.
- A simulated sleep session that starts automatically after entering the session screen.
- A deterministic wake engine that evaluates wakeability, stability, timing pressure, stable wake zones, drop protection, and latest-time fallback.
- A foreground-only simulation clock that advances only while the app is active and pauses while inactive/backgrounded.
- A latest-wake-time local notification fallback scheduled from real device wall-clock time when a session starts.
- Automatic navigation to a foreground alarm ringing screen when the simulated engine first decides the alarm should trigger.
- Cancellation of the scheduled fallback notification when the foreground engine triggers or the session is stopped.
- A foreground alarm experience with local audio playback, vibration, demo snooze, stop action, and safe navigation into results.
- A result summary with wake mode, latest wake time, wake window, reason code, explanation items, and a simple wakeability timeline.
- A clear saved data action for local settings and recent summaries.

The app remains prototype-only. It does not use real sensors, background wake-engine execution, background tasks, push notifications, backend services, auth, ML, wearables, cloud sync, or medical sleep-stage claims.

## Current Tech Stack
- Expo SDK 54.
- React 19.1.
- React Native 0.81.
- TypeScript.
- React Navigation native stack.
- AsyncStorage via `@react-native-async-storage/async-storage`.
- Foreground audio via `expo-audio`.
- Foreground keep-awake via `expo-keep-awake`.
- Local scheduled notifications via `expo-notifications`.
- Jest with `jest-expo`.
- React Native Testing Library.

## Current Commands
- Start dev server: `npm start`
- Typecheck: `npm run typecheck`
- Test: `npm test -- --runInBand`

## Current Test Status
The latest known passing verification is:
- `npm run typecheck`
- `npm test -- --runInBand`

Current test coverage includes:
- Alarm settings defaults.
- Alarm settings local storage.
- Settings restore and clear local data UI behavior.
- Settings to session flow.
- Simulation stream behavior, including AppState pause/resume.
- Wake engine behavior.
- Notification fallback scheduling, permission denial, cancellation, and next-clock-time calculation.
- Result screen rendering.
- Result summary local storage.
- Session to alarm ringing to result navigation.
- Foreground alarm screen rendering, stop, snooze, audio/vibration cleanup, and mocked audio behavior.

## Completed Milestones
- Milestone 1: app skeleton, navigation, alarm settings flow.
- Milestone 2: session coordination shell and deterministic simulation stream.
- Milestone 3: pure wake engine V1 and session debug integration.
- Milestone 4: result explanation flow and minimal result UI.
- Milestone 4.5: UI cleanup, scroll fixes, and alarm-clock-style time picker.
- Milestone 5: AsyncStorage persistence for settings and recent result summaries.
- Milestone 6: foreground alarm ringing experience with sound, vibration, snooze, keep-awake, and result handoff.
- Milestone 7: latest-wake-time local notification fallback.
- Milestone 7.1: pause accelerated simulation while app is inactive/backgrounded.

## Known Limitations
- Smart wake detection and the wake engine run only while the app is active in the foreground.
- The local notification fallback is only a latest-time reminder; it does not perform background smart wake detection.
- Notification timing and presentation remain subject to mobile OS behavior and Expo Go/development build limitations.
- Foreground alarm audio and vibration require the app to stay open and active.
- No system-level exact alarm implementation yet.
- No real device sensors.
- No wearable integration.
- No backend, auth, cloud sync, or multi-device support.
- Recent session history stores lightweight summaries only, not full wake score timelines.
- The wake engine is heuristic and prototype-focused, not medical sleep staging.

## Important Constraints
Do not add these without an explicit new milestone or product decision:
- Backend services.
- Login/auth.
- Cloud sync.
- Subscriptions or billing.
- Wearable integrations.
- Real sensor integration.
- Background wake-engine execution.
- Background tasks.
- Push notifications.
- System-level exact alarm behavior.
- Medical sleep-stage claims.
- ML or personalization pipelines.
- Heavy chart or UI libraries.

## What Not To Change Casually
- `AlarmSettings` shape: keep `latestWakeTime: ClockTime`, `wakeWindowMinutes`, and lowercase `wakeMode`.
- `WakeMode` values: keep `"fast" | "balanced" | "comfort"`.
- `ClockTime` model: do not convert to Date or DateTime.
- Wake engine purity: keep engine logic UI-independent and deterministic.
- Simulation sample pattern: keep it deterministic and replaceable.
- Simulation timing: accelerated simulated time should advance only while AppState is active; notification fallback should stay based on real wall-clock time.
- Notification service boundary: keep `expo-notifications` calls isolated under `src/services/notifications`.
- Persistence boundaries: keep AsyncStorage adapters isolated under `src/data/storage`.
- Stored result history: keep it lightweight unless explicitly requested.
- Product language: use "wakeability", "stable wake zone", "timing pressure", "latest-time fallback", and "phone-based best effort"; avoid medical claims.
