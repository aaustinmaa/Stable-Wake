# NEXT_MILESTONE_PLAN.md

## Recommended Next Milestone: Milestone 5 Local Persistence
The recommended next milestone is local persistence for settings and recent session summaries.

This should remain local-first and single-user. Do not add backend, auth, cloud sync, billing, wearables, medical claims, or ML.

## Goals
- Persist the user's latest alarm settings locally.
- Restore saved settings when the app opens.
- Optionally persist a small list of recent session result summaries.
- Keep persistence isolated under `src/data/storage`.

## Suggested Scope
Add:
- `src/data/storage/settingsStorage.ts`
- `src/data/storage/sessionResultStorage.ts` only if recent results are included.
- A small hook-level integration in alarm settings for loading/saving settings.
- Tests for storage serialization and settings restore behavior.

Use:
- AsyncStorage, because `ARCHITECTURE.md` names it as the V1 local persistence direction.

## Suggested Data
Settings persistence:
- `latestWakeTime`
- `wakeWindowMinutes`
- `wakeMode`

Recent result summary persistence, if included:
- trigger timestamp
- wake mode
- latest wake time
- wake window
- reason code
- explanation item codes/titles

Keep stored summaries compact. Do not persist raw high-volume debug streams unless explicitly requested.

## Out Of Scope For Milestone 5
Do not add:
- Backend.
- Login/auth.
- Cloud sync.
- Wearables.
- Real sensors.
- Alarm audio, vibration, or notifications.
- Medical sleep-stage claims.
- ML/personalization.
- Heavy analytics.
- Full history dashboard.

## Acceptance Criteria
- App can load saved alarm settings.
- Changing settings updates local saved settings.
- App still works when no saved settings exist.
- App handles invalid/corrupt saved data safely by falling back to defaults.
- Existing session simulation, wake engine, result navigation, and tests still pass.
- New storage tests pass.

## Current Test Commands
Run before and after Milestone 5:
- `npm run typecheck`
- `npm test -- --runInBand`

