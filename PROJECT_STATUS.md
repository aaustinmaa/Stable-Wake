# PROJECT_STATUS.md

## Current State
StableWake is a local-first Expo React Native prototype with milestones 1, 2, 3, 4, and 4.5 completed.

The app currently supports:
- Alarm settings with latest wake time, wake window, and wake mode.
- A simulated sleep session that starts automatically after entering the session screen.
- A deterministic wake engine that evaluates wakeability, stability, timing pressure, stable wake zones, drop protection, and latest-time fallback.
- Automatic navigation to a result screen when the simulated engine first decides the alarm should trigger.
- A result summary with wake mode, latest wake time, wake window, reason code, explanation items, and a simple wakeability timeline.

The app remains prototype-only. It does not use real sensors, alarm audio, vibration, notifications, persistence, backend services, auth, ML, wearables, or medical sleep-stage claims.

## Current Tech Stack
- Expo SDK 54.
- React 19.1.
- React Native 0.81.
- TypeScript.
- React Navigation native stack.
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
- Settings to session flow.
- Simulation stream behavior.
- Wake engine behavior.
- Result screen rendering.
- Session to result navigation.

## Completed Milestones
- Milestone 1: app skeleton, navigation, alarm settings flow.
- Milestone 2: session coordination shell and deterministic simulation stream.
- Milestone 3: pure wake engine V1 and session debug integration.
- Milestone 4: result explanation flow and minimal result UI.
- Milestone 4.5: UI cleanup, scroll fixes, and alarm-clock-style time picker.

## Important Constraints
Do not add these without an explicit new milestone or product decision:
- Backend services.
- Login/auth.
- Cloud sync.
- AsyncStorage persistence.
- Subscriptions or billing.
- Wearable integrations.
- Real sensor integration.
- Alarm audio, vibration, or notifications.
- Medical sleep-stage claims.
- ML or personalization pipelines.
- Heavy chart or UI libraries.

## What Not To Change Casually
- `AlarmSettings` shape: keep `latestWakeTime: ClockTime`, `wakeWindowMinutes`, and lowercase `wakeMode`.
- `WakeMode` values: keep `"fast" | "balanced" | "comfort"`.
- `ClockTime` model: do not convert to Date or DateTime.
- Wake engine purity: keep engine logic UI-independent and deterministic.
- Simulation purpose: keep it replaceable and deterministic.
- Product language: use "wakeability", "stable wake zone", "timing pressure", and "phone-based best effort"; avoid medical claims.

