# CURRENT_ARCHITECTURE.md

## Overview
StableWake is structured as a small Expo React Native TypeScript app. UI lives in `src/features`, domain logic lives in `src/domain`, simulation lives in `src/services/simulation`, and shared constants/utilities live in `src/shared`.

## Folder Structure
```text
src/
  app/
    App.tsx
    navigation/
      RootNavigator.tsx
      routeTypes.ts

  domain/
    models/
      AlarmSettings.ts
      ClockTime.ts
      ExplanationItem.ts
      SessionResult.ts
      SessionStatus.ts
      SleepSample.ts
      WakeDecision.ts
      WakeMode.ts
      WakeScore.ts
    wake-engine/
      computeRawWakeability.ts
      computeStability.ts
      computeTimingPressure.ts
      decideWakeTrigger.ts
      detectStableWakeZone.ts
      smoothWakeability.ts
      wakeEngine.ts
      wakeEngine.types.ts

  features/
    alarm-settings/
      components/
        TimePickerCard.tsx
        WakeModeSelector.tsx
        WakeWindowSelector.tsx
      hooks/
        useAlarmSettings.ts
      screens/
        AlarmSettingsScreen.tsx
    results/
      components/
        ExplanationList.tsx
        WakeabilityTimeline.tsx
        WakeSummaryCard.tsx
      screens/
        ResultScreen.tsx
    sleep-session/
      hooks/
        useSleepSession.ts
      screens/
        SleepSessionScreen.tsx

  services/
    simulation/
      createSimulatedSleepStream.ts

  shared/
    constants/
      defaults.ts
    utils/
      time.ts
    theme.ts
```

## Navigation
Routes are defined in `src/app/navigation/routeTypes.ts`:
- `AlarmSettings: undefined`
- `SleepSession: { settings: AlarmSettings }`
- `Result: { result: SessionResult }`

Flow:
1. `AlarmSettingsScreen`
2. `SleepSessionScreen`
3. `ResultScreen`

## Current Domain Models
- `ClockTime`: `{ hour: number; minute: number }`
- `WakeMode`: `"fast" | "balanced" | "comfort"`
- `AlarmSettings`: latest wake time, wake window minutes, wake mode.
- `SleepSample`: timestamp in simulated milliseconds, motion score, sound score.
- `SessionStatus`: `"configured" | "monitoring" | "wake_window_active" | "completed"`
- `WakeScore`: raw wakeability, smoothed wakeability, stability score, timing pressure.
- `ExplanationItem`: code, title, description.
- `WakeDecision`: should trigger, reason code, explanation items.
- `SessionResult`: trigger timestamp, mode/settings, reason, explanations, wake scores, selected settings.

## Wake Engine Behavior
The wake engine is pure and UI-independent. Entry point:
- `evaluateWakeEngine(input)` in `src/domain/wake-engine/wakeEngine.ts`

It currently:
- Computes raw wakeability from weighted motion and sound scores.
- Smooths wakeability with a rolling average.
- Computes stability from recent smoothed wakeability above threshold.
- Computes timing pressure across the wake window.
- Detects stable wake zones.
- Triggers for stable sustained opportunities, drop protection, or latest fallback.
- Returns `WakeEngineOutput` with current score, all wake scores, stable-zone status, and decision.

Mode config:
- `fast`: lower thresholds, 5-minute candidate hold.
- `balanced`: medium thresholds, 10-minute candidate hold.
- `comfort`: higher thresholds, 15-minute candidate hold.

Hard behavior currently covered by tests:
- No trigger before wake window.
- Isolated spike does not trigger.
- Latest fallback triggers at latest wake time.
- Stable rising sequence respects mode order.
- Trigger explanations are present.
- Same input is deterministic.
- Drop protection can trigger when a stable opportunity degrades.

## Simulation Behavior
Simulation lives in `src/services/simulation/createSimulatedSleepStream.ts`.

Current behavior:
- Session starts automatically when `SleepSessionScreen` mounts.
- Acceleration is 1 real second = 1 simulated minute.
- Samples are deterministic.
- The first 10 simulated minutes are before the wake window.
- After wake window starts, simulated wakeability rises into a stable wakeable segment.
- The default simulation can trigger before latest fallback.
- The stream cleans up its interval on stop/unmount.

The simulation is intentionally simple and replaceable. It should not be treated as real sensor input.

## UI Behavior
`AlarmSettingsScreen`:
- Uses a custom two-wheel time picker for hour and minute.
- Uses preset wake windows.
- Uses wake mode buttons.
- Passes selected settings to the session route.

`SleepSessionScreen`:
- Uses `SafeAreaView` and `ScrollView`.
- Shows selected settings, simulated time, elapsed simulated time, wake window state, sample values, and wake engine debug metrics.
- Automatically starts simulation on mount.
- Navigates to `ResultScreen` when the engine first returns `shouldTrigger: true`.

`ResultScreen`:
- Uses `SafeAreaView` and `ScrollView`.
- Shows trigger time, reason, selected settings, explanation items, and a simple bar timeline of wakeability.
- Does not claim sleep stages or medical accuracy.

