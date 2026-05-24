# CURRENT_ARCHITECTURE.md

## Overview
StableWake is a small Expo React Native TypeScript app. UI lives in `src/features`, domain logic lives in `src/domain`, local persistence lives in `src/data/storage`, simulation lives in `src/services/simulation`, local notification fallback logic lives in `src/services/notifications`, and shared constants/utilities live in `src/shared`.

## Folder Structure
```text
src/
  app/
    App.tsx
    navigation/
      RootNavigator.tsx
      routeTypes.ts

  data/
    storage/
      alarmSettingsStorage.ts
      sessionResultStorage.ts
      storageKeys.ts

  domain/
    models/
      AlarmSettings.ts
      ClockTime.ts
      ExplanationItem.ts
      SessionResult.ts
      SessionResultSummary.ts
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
        RecentSessionsCard.tsx
        TimePickerCard.tsx
        WakeModeSelector.tsx
        WakeWindowSelector.tsx
      hooks/
        useAlarmSettings.ts
      screens/
        AlarmSettingsScreen.tsx
    alarm-ringing/
      hooks/
        useForegroundAlarm.ts
      screens/
        AlarmRingingScreen.tsx
    results/
      components/
        ExplanationList.tsx
        WakeabilityTimeline.tsx
        WakeSummaryCard.tsx
      screens/
        ResultScreen.tsx
      utils/
        createSessionResultSummary.ts
    sleep-session/
      hooks/
        useSleepSession.ts
      screens/
        SleepSessionScreen.tsx

  services/
    notifications/
      notification.types.ts
      notificationService.ts
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
- `AlarmRinging: { result: SessionResult; fallbackNotificationId?: string | null }`
- `Result: { result: SessionResult }`

Flow:
1. `AlarmSettingsScreen`
2. `SleepSessionScreen`
3. `AlarmRingingScreen`
4. `ResultScreen`

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
- `SessionResultSummary`: lightweight persisted recent session summary.
- Notification service types: permission state, fallback status, scheduled fallback notification metadata.

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
- Acceleration is 1 active real second = 1 simulated minute.
- Accelerated simulated time advances only while React Native `AppState` is active.
- When AppState becomes inactive/backgrounded, active elapsed time is banked and the simulation clock pauses.
- When AppState returns active, simulation resumes from the previous accumulated active elapsed time.
- Samples are deterministic.
- The first 10 simulated minutes are before the wake window.
- After wake window starts, simulated wakeability rises into a stable wakeable segment.
- The default simulation can trigger before latest fallback.
- The stream cleans up its interval and AppState listener on stop/unmount.
- When the wake engine triggers, the session builds the same `SessionResult` as before and routes to the foreground ringing screen.

The simulation is intentionally simple and replaceable. It should not be treated as real sensor input.

## Notification Fallback Behavior
Notification fallback logic lives in `src/services/notifications/notificationService.ts`.

Current behavior:
- On session start, the app requests notification permission if needed.
- It computes the next local wall-clock occurrence of `AlarmSettings.latestWakeTime`.
- It schedules one local notification with title `StableWake fallback alarm` and body `Latest wake time reached.`.
- The notification uses real device wall-clock time, not accelerated simulation time.
- If permission is denied or scheduling fails, the session continues and the UI shows that fallback is disabled/unavailable.
- If the foreground wake engine triggers early, the scheduled fallback notification is cancelled to avoid duplicate alerts.
- If the user stops the session, the scheduled fallback notification is cancelled.
- Android notification channel setup is handled in the notification service.
- No background wake engine, background task, push token, remote push notification, recurrence, or notification-tap navigation is implemented.

## UI Behavior
`AlarmSettingsScreen`:
- Loads saved alarm settings from local storage.
- Uses a custom two-wheel time picker for hour and minute.
- Uses preset wake windows.
- Uses wake mode buttons.
- Shows recent simulated session summaries.
- Provides a non-prominent clear saved data action.
- Passes selected settings to the session route.

`SleepSessionScreen`:
- Uses `SafeAreaView` and `ScrollView`.
- Shows selected settings, simulated time, elapsed simulated time, wake window state, sample values, and wake engine debug metrics.
- Shows latest-time fallback notification status and an honest note that smart wake works while the app is active.
- Automatically starts simulation on mount.
- Uses keep-awake while the foreground session is active.
- Navigates to `AlarmRingingScreen` when the engine first returns `shouldTrigger: true`.

`AlarmRingingScreen`:
- Uses `SafeAreaView` and `ScrollView`.
- Starts foreground-only audio with `expo-audio` and vibration when ringing.
- Uses local `assets/audio/alarm-sound.mp3` for the foreground alarm sound.
- Shows trigger time, reason, wake mode, selected wake settings, Stop, and a clearly labeled demo snooze action.
- Stops audio/vibration on Stop, Snooze, unmount, and leaving the screen.
- Defensively cancels any remaining fallback notification on Stop.
- Uses `replace` navigation into `ResultScreen` so users do not back-navigate into a ringing screen.
- Uses keep-awake while the foreground ringing screen is active.
- Clearly states that this is a foreground prototype alarm and does not provide background alarm support.

`ResultScreen`:
- Uses `SafeAreaView` and `ScrollView`.
- Shows trigger time, reason, selected settings, explanation items, and a simple bar timeline of wakeability.
- Saves a lightweight recent session summary locally.
- Does not claim sleep stages or medical accuracy.

## Persistence Behavior
Persistence uses AsyncStorage through isolated storage adapters:
- `alarmSettingsStorage.ts`
- `sessionResultStorage.ts`

Stored data:
- Alarm settings: `latestWakeTime`, `wakeWindowMinutes`, `wakeMode`.
- Recent session summaries: id, completed timestamp, trigger timestamp, wake mode, latest wake time, wake window, reason code.

Storage behavior:
- Uses versioned keys from `storageKeys.ts`.
- JSON serializes/deserializes small local payloads.
- Validates loaded data before using it.
- Falls back safely for missing, malformed, or invalid storage.
- Keeps recent summaries newest-first and capped at 5.
- Does not persist full wake score arrays.
- Does not persist scheduled notification identifiers.
