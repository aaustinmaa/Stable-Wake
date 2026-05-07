# WAKE_ENGINE_SPEC.md

## Purpose
The Stable Wake Engine decides when the alarm should ring.

It does not attempt to perform medically accurate sleep staging.
Its job is to estimate:
1. how wakeable the user seems right now
2. whether that wakeable state is stable
3. whether now is the right time to trigger the alarm

## Core concepts

### Wakeability
A score representing how likely the user is in an easier-to-wake state at the current moment.

Example influences:
- motion level
- change in motion
- sound variability
- recent trend

Range:
0.0 to 1.0

### Stability
A measure of whether wakeability is sustained over time instead of appearing as a brief noisy spike.

### Timing pressure
A measure of how close we are to the latest required alarm time.

## Inputs
The engine receives:
- AlarmSettings
- a time-ordered stream of SleepSample values
- current time
- wake window boundaries

## Output
The engine returns a WakeDecision:
- shouldTrigger: boolean
- triggerTime: timestamp | null
- reasonCode
- explanationItems[]
- debugMetrics (optional)

## Domain entities

### AlarmSettings
- latestWakeTime
- wakeWindowMinutes
- wakeMode: Fast | Balanced | Comfort

### SleepSample
Represents one sample in time.
Fields:
- timestamp
- motionScore
- soundScore
- optional source metadata

### WakeScore
Fields:
- timestamp
- rawWakeability
- smoothedWakeability
- stabilityScore
- timingPressure

### WakeDecision
Fields:
- shouldTrigger
- triggerTime
- reasonCode
- explanationItems

### ExplanationItem
Fields:
- code
- title
- description

## Hard constraints
1. Never trigger before wake window starts
2. Always trigger by latestWakeTime
3. Never trigger based on a single isolated spike alone
4. Comfort mode should not trigger earlier than Fast mode for the same data
5. The engine must be deterministic for the same input sequence

## V1 algorithm philosophy
The V1 engine should use simple, explainable rules.
Do not use ML in V1.

## V1 processing steps

### Step 1: compute raw wakeability
For each SleepSample:
- combine motion and sound signals into a raw wakeability score

Example direction:
rawWakeability = weighted combination of:
- current motion
- short-term motion variance
- sound variability
- optional trend bonus

### Step 2: smooth wakeability
Use a rolling average or exponential smoothing so the decision does not react to tiny fluctuations.

### Step 3: compute stability
Stability should reflect whether wakeability has remained above a threshold across a recent rolling window.

Example concept:
- look at the last N samples
- count how many are above wakeability threshold
- compute a stability score from proportion and consistency

### Step 4: evaluate timing pressure
As the latest wake time approaches, the engine becomes less selective.

### Step 5: decide trigger
Use mode-specific logic.

## Stable wake zone definition (V1 concept)
A stable wake zone exists when:
- smoothed wakeability is above threshold
- a sufficient proportion of recent samples are above threshold
- there is no major recent drop
- wake window is active

This should be implemented as an explainable heuristic, not a black box.

## Wake mode definitions

### Fast
Goal:
Wake soon after a decent stable opportunity appears.

Behavior:
- lower stability requirement
- shorter candidate wait
- more willing to trigger early

### Balanced
Goal:
Default tradeoff between comfort and risk.

Behavior:
- medium stability requirement
- moderate candidate wait
- moderate tolerance for waiting

### Comfort
Goal:
Prefer a more mature stable wakeable period.

Behavior:
- higher stability requirement
- longer candidate wait
- willing to wait more unless timing pressure becomes high

## Suggested V1 heuristics

### Wakeability threshold
A configurable constant used to separate "probably wakeable" from "not wakeable enough yet".

### Stability window
A rolling window of recent samples, for example:
- 3 to 6 minutes worth of samples

### Candidate wait
Once a stable wake zone is first detected, require a minimum candidate duration before firing.

Mode examples:
- Fast: short wait
- Balanced: medium wait
- Comfort: longer wait

### Drop protection
If a stable wake zone begins to degrade after candidate state was reached, the engine may trigger before losing the opportunity entirely.

### Latest-time fallback
If no suitable stable wake zone appears, fire at latestWakeTime.

## Example trigger logic

### Fast
Trigger when:
- wake window active
- wakeability above threshold
- stability acceptable
- candidate wait satisfied OR timing pressure high

### Balanced
Trigger when:
- wake window active
- stable wake zone confirmed
- candidate wait satisfied
- no strong negative drop signal
OR
- timing pressure high

### Comfort
Trigger when:
- wake window active
- strong stable wake zone confirmed
- longer candidate wait satisfied
- trend not worsening
OR
- timing pressure high

## Explanation rules
Every trigger must generate at least one human-readable reason.

Possible explanation items:
- stable_wake_zone_detected
- wakeability_sustained
- timing_pressure_increased
- fallback_latest_alarm
- opportunity_would_be_lost

## Acceptance criteria
The engine is acceptable when:
1. it never triggers before wake window
2. it always triggers by latestWakeTime
3. it ignores isolated spikes
4. Fast is earlier or equal to Balanced on the same input
5. Balanced is earlier or equal to Comfort on the same input when timing pressure is low
6. it produces explanations for every trigger

## Example test scenarios

### Case A: isolated spike
Input:
low values, one high spike, then low again
Expected:
do not trigger

### Case B: stable moderate rise
Input:
gradually rising wakeability that stays elevated
Expected:
Fast triggers first, then Balanced, then Comfort

### Case C: no opportunity
Input:
low/unstable values until end of wake window
Expected:
trigger at latestWakeTime with fallback explanation

### Case D: stable zone then drop
Input:
stable wake zone appears, then scores start falling
Expected:
engine may trigger before opportunity disappears

## V2+ ideas (not for V1)
- adaptive per-user thresholds
- better trend modeling
- use of device sensor streams
- local personalization
- optional cloud analysis