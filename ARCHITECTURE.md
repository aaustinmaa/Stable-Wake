# ARCHITECTURE.md

## Tech direction
- React Native
- TypeScript
- Expo
- Local-first architecture
- No backend for V1
- Zustand for lightweight app state if needed
- AsyncStorage for local persistence
- Simple chart library only if needed for the timeline view

## Architectural principles
1. Keep business logic separate from UI
2. Keep wake engine isolated from screen components
3. Prefer local storage over remote infrastructure
4. Prefer simple data flow over abstract patterns
5. Design for AI-assisted implementation:
   - small files
   - clear naming
   - explicit module boundaries

## High-level module map

### 1. app
App bootstrap, navigation, providers, app shell.

### 2. features/alarm-settings
UI and logic for:
- latest wake-up time
- wake window
- wake mode

Outputs:
- AlarmSettings object

Does not handle:
- wake engine calculations
- session monitoring logic

### 3. features/sleep-session
Controls session lifecycle:
- idle
- configured
- monitoring
- in wake window
- candidate wake zone
- alarm triggered
- session complete

Coordinates data flow between settings, signal input, wake engine, and result generation.

### 4. features/results
Displays:
- when the alarm rang
- why it rang
- wakeability timeline / chart
- explanation items

### 5. domain/wake-engine
Core product logic.
Responsible for:
- wakeability scoring
- smoothing
- stable wake zone detection
- trigger decisions
- mode-specific behavior

Must not depend on screen/UI code.

### 6. domain/models
Type definitions and domain entities:
- AlarmSettings
- SleepSample
- WakeScore
- WakeDecision
- SleepSession
- SessionResult
- ExplanationItem

### 7. services/simulation
Provides simulated sleep samples for prototype mode.

### 8. services/device-input
Future-facing adapters for:
- motion input
- audio-derived input
- timers
- alarm/notification integration

V1 may stub or mock most of this.

### 9. data/storage
Local persistence for:
- saved settings
- recent session summaries
- optional local debug data

## Data flow

### Setup flow
Alarm Settings Screen
-> creates AlarmSettings
-> stored in local state
-> optionally persisted in AsyncStorage

### Session flow
Sleep Session starts
-> Simulation or local input service emits SleepSample values over time
-> Wake Engine processes rolling samples
-> Wake Engine emits WakeScore and WakeDecision updates
-> Sleep Session feature updates session state
-> If trigger condition met, alarm fires
-> SessionResult is created
-> Results screen renders explanation and chart

## Session state machine

### States
1. idle
2. configured
3. monitoring
4. wake_window_active
5. candidate_wake_zone
6. alarm_triggered
7. completed

### Transitions
- idle -> configured
- configured -> monitoring
- monitoring -> wake_window_active
- wake_window_active -> candidate_wake_zone
- candidate_wake_zone -> wake_window_active (if stability is lost)
- candidate_wake_zone -> alarm_triggered
- wake_window_active -> alarm_triggered (if latest time reached)
- alarm_triggered -> completed

## Suggested folder structure

src/
  app/
    App.tsx
    navigation/
      RootNavigator.tsx

  features/
    alarm-settings/
      screens/
        AlarmSettingsScreen.tsx
      components/
        TimePickerCard.tsx
        WakeModeSelector.tsx
      hooks/
        useAlarmSettings.ts

    sleep-session/
      screens/
        SleepSessionScreen.tsx
      hooks/
        useSleepSession.ts
      state/
        sleepSessionStore.ts

    results/
      screens/
        ResultScreen.tsx
      components/
        WakeSummaryCard.tsx
        ExplanationList.tsx
        WakeabilityChart.tsx

  domain/
    models/
      AlarmSettings.ts
      SleepSample.ts
      WakeScore.ts
      WakeDecision.ts
      SleepSession.ts
      SessionResult.ts
      ExplanationItem.ts

    wake-engine/
      computeWakeScore.ts
      detectStableWakeZone.ts
      decideAlarmTrigger.ts
      wakeEngine.ts
      wakeModes.ts

  services/
    simulation/
      generateSleepSamples.ts
      samplePatterns.ts

    device-input/
      audioInputService.ts
      motionInputService.ts
      alarmService.ts
      timerService.ts

  data/
    storage/
      settingsStorage.ts
      sessionStorage.ts

  shared/
    constants/
      defaults.ts
    utils/
      time.ts
      rollingWindow.ts
    types/
      common.ts

  tests/
    unit/
    integration/

## Why no backend in V1
The app’s core value is local decision logic, not cloud sync.
A backend adds complexity without helping validate the core product insight.