# AGENTS.md

## Project purpose
This repository contains StableWake, a mobile-only smart alarm prototype.
Its core idea is:
wake at a more stable wakeable period, not at the first likely light-sleep moment.

## Product boundaries
V1 is local-first and single-user.
Do not add:
- backend services
- login/auth
- cloud sync
- subscriptions
- wearable integrations
- medical sleep-stage claims
- ML pipelines unless explicitly requested

## Technical stack
- React Native
- TypeScript
- Expo
- Local storage only for V1

## Architecture rules
- Keep business logic separate from UI
- Keep wake engine isolated from screens/components
- Put reusable domain logic in `src/domain/`
- Put feature UI in `src/features/`
- Put local persistence in `src/data/storage/`
- Put simulation/device adapters in `src/services/`
- Avoid unnecessary abstractions

## Source-of-truth files
Before implementing, follow:
- PRODUCT_SCOPE.md
- ARCHITECTURE.md
- WAKE_ENGINE_SPEC.md

If implementation conflicts with those files, prefer updating the plan/spec first instead of silently improvising.

## Coding rules
- Use TypeScript everywhere
- Prefer small files and clear function names
- Avoid giant multi-responsibility components
- Prefer pure functions for wake-engine logic
- Keep UI components presentational where possible
- Keep side effects inside hooks/services
- Do not mix trigger logic into screen components

## File size guidance
- Prefer files under ~250 lines
- Prefer functions under ~40 lines when practical
- Split code when responsibility becomes mixed

## Naming
- Use descriptive names
- Avoid vague utility files like `helpers.ts` if domain-specific names are possible
- Use domain language consistently:
  - wakeability
  - stability
  - stable wake zone
  - timing pressure
  - latest wake time

## Testing expectations
When modifying wake-engine logic:
- add or update unit tests

When modifying settings/session/results flow:
- add or update integration or component-level tests where practical

Minimum required behaviors:
- never trigger before wake window
- always trigger by latest wake time
- isolated spikes should not trigger
- every trigger must include an explanation

## Definition of done
A task is not done unless:
1. code compiles
2. tests relevant to the changed logic pass
3. the implementation matches the product/spec files
4. no forbidden V1 scope creep was added
5. the code remains understandable for AI-assisted iteration

## Implementation preference
For large or ambiguous tasks:
1. propose a plan first
2. identify affected files
3. implement in small steps
4. verify incrementally

## Current priority order
1. app skeleton and navigation
2. alarm settings flow
3. simulation-based sleep session
4. wake engine
5. result explanation UI
6. local persistence
7. optional device-input integration

## What to optimize for
Optimize for:
- fast, clean prototype delivery
- explainable logic
- maintainable structure
- honest product behavior

Do not optimize for:
- premature scale
- premature infrastructure
- fake scientific complexity