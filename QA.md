# SHÙ verification record — 2026-10-31

## Automated checks

`npm test`: 8 test groups passed.

- Boundary readings including 0, 10, 101, 1,001, 10,001, 10,010, 20,005, 99,999.
- Structural invariants and uniqueness for all 100,000 integers in 0–99,999.
- Independent parser decodes all 100,000 generated readings back to their source integer.
- Prices: decimal precision, missing jiao, zero, fullwidth digits, invalid negative/overprecision inputs.
- Time boundaries: midnight, 两点, leading-zero minutes, 23:59; rejection of 24:00 and minute 60.
- Phone digit readings including 幺, fullwidth and spaced answer normalization, 11-digit length.
- 144 unique IDs, 12 distinct answers per mode/level, exact answer normalization roundtrips.
- Regression: fixed two repeated phone answers caused by the original prefix cycle; regenerated all 36 phone clips.

## Audio asset checks

All 144 clips were regenerated using the open AISHELL-3 model after discarding the macOS-voice approach. Each generation required a non-empty waveform and nontrivial peak amplitude. ffprobe validated every final file: duration 0.38–3.50 seconds. Total audio bytes: 1,725,261.

Audio is synthetic. These checks establish generated, decodable files, not native-teacher pronunciation approval.

## Browser checks (Chrome)

- Desktop 1440×900: layout, controls, field notes, keyboard/answer interaction.
- Emulated mobile 390×844 and 360×800: no horizontal overflow, workout/level selection, playback, slow replay, input and feedback.
- All 12 mode/level combinations: accepted the expected answer and displayed correct feedback.
- Ten-question session completed with 9/10; the single missed question could be reviewed and completed at 1/1.
- Progress survived page reload; review did not increment first-attempt lifetime stats.
- Invalid price precision showed the format hint and did not advance the question.
- Actual browser audio playback reached readyState 4 with finite duration and no media error for sampled clips, including phone strings. All final files separately passed metadata checks. Immediate readyState 0 on some freshly replaced clips is a loading state, not claimed as playback verification.
- No console errors during the tested interactions.

## Public deployment verification

Sites version 1 deployed successfully. The root document and sampled audio each returned HTTP 200 to curl without cookies. Chrome on the live URL decoded audio (readyState 4, finite duration), accepted the expected answer, and reported no console errors. Live desktop/mobile screenshots were saved. The final revision also removes duplicate phone answers and packages assets for an offline, dependency-free build; its version is recorded after publication.

## Pending separate evidence

 Physical iPhone/Android, Safari, screen-reader walkthrough, and native Mandarin teacher pronunciation review have not been performed.
