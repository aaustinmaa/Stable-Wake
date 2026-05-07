# PRODUCT_SCOPE.md

## Product name
StableWake

## One-line product definition
A mobile-only smart alarm that waits for a more stable wakeable period instead of ringing at the first likely light-sleep moment.

## Product vision
Most smart alarms try to wake the user at the first opportunity.
StableWake aims to wake the user at a more comfortable time by looking for a stable wakeable period, not just a single wakeable spike.

## Core product philosophy
This app does not claim medical-grade sleep stage detection.
It estimates wakeability using phone-available signals and local heuristics.

## Target user
People who:
- dislike being woken too early by existing smart alarms
- want a more comfortable wake-up experience
- are okay with a best-effort estimate rather than medically precise sleep staging

## V1 goals
The first version should:
1. let the user set a latest wake-up time
2. let the user choose a wake window
3. let the user choose a wake mode:
   - Fast
   - Balanced
   - Comfort
4. run fully on-device
5. estimate wakeability from simulated or simple local inputs
6. detect a stable wakeable zone
7. trigger the alarm according to the selected mode
8. explain why the alarm rang at that time
9. show a simple wakeability timeline or curve
10. work without login, backend, or cloud sync

## Key differentiator
Typical smart alarm:
- ring at the first likely light-sleep moment

StableWake:
- wait for a more stable wakeable period unless waiting becomes too risky

## Non-goals for V1
Do not build:
- accounts
- cloud sync
- wearable integrations
- subscriptions or billing
- medical sleep staging
- advanced ML pipelines
- social/community features
- multi-device support
- clinician-facing analytics
- backend APIs unless later proven necessary

## User flow
1. User opens app
2. User configures:
   - latest wake-up time
   - wake window
   - wake mode
3. User starts a sleep session
4. App enters monitoring state
5. During wake window, app evaluates wakeability over time
6. App detects a stable wakeable zone
7. App triggers alarm when strategy conditions are met
8. App shows result summary:
   - alarm time
   - mode used
   - why it rang
   - simple wakeability chart/timeline

## V1 success criteria
V1 is successful if:
- a user can configure and start a session
- the app can simulate or process time-series sleep-like samples
- the wake engine makes a trigger decision
- the app always triggers by the latest alarm time
- the result page clearly explains the trigger decision
- the app architecture stays simple enough for AI-assisted iteration

## Honest user-facing positioning
The app should say:
- "estimates wakeability"
- "finds a stable wakeable period"
- "phone-based best effort"

The app should not say:
- "detects REM precisely"
- "medical-grade sleep analysis"
- "clinically accurate sleep stages"

## V1 deliverable definition
The V1 deliverable is a clean, local-first mobile prototype with:
- settings flow
- sleep session flow
- wake engine
- results explanation
- mocked or simple local signal pipeline