# Google Translate voice release — 2026-10-31

Owner approved the exact normal-speed zh-CN/com reference for 14:05 / 十四点零五分: “chốt, hài lòng 100%!!! apply vioice này cho product!!!!”. This release replaces the former Icefall bank with 144 prepared Google Translate MP3 clips and includes that unchanged approved reference. Normal playback is 1.0 across every mode/level, including phones; optional slow replay is 0.8 with pitch preservation. No audio processing or extra punctuation is applied to the returned files. Filenames and the entry module URL are versioned to avoid mixing cached old audio with the new bank.

Generation validation: all prepared clips must match the engine's spoken text/answer and decode fully with ffmpeg. The asset regression test verifies every clip's SHA-256, count, and approved-reference bytes. This is technical/source verification; owner approval of one voice reference is not individual teacher review of every question.

New release build/browser/live evidence is recorded in the release handoff. The original release history below is retained as historical evidence, including its former voice-quality limitation.

---

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

Sites version 1 deployed successfully. The root document and sampled audio each returned HTTP 200 to curl without cookies. Chrome on the live URL decoded audio (readyState 4, finite duration), accepted the expected answer, and reported no console errors. Live desktop/mobile screenshots were saved. Sites version 2 deployed successfully with the duplicate-phone fix. Its live engine.js and a regenerated phone clip each returned HTTP 200 without cookies and matched local SHA-256 hashes. The live phone workout played a complete 3.5-second clip (readyState 4, ended=true, no media error). Enter submitted an expected phone answer correctly at 390px.

GitHub publication: https://github.com/batman-begun/hanzi_hub

A fresh public clone at code commit ccd260fd5d32ed2c62707048d906a808dc8563cd passed all 8 tests and built without dependency installation or network use. All 157 restored web files matched the deployed source checkout byte-for-byte. This final documentation update does not change app code.

Production: https://shu-mandarin-number-gym.batmanbegun.chatgpt.site

Sites source commit: ce9deaf35bed131139201448821a502873e9fa4f

Sites saved version: appgprj_6ae5731f39748191b6cc51b09e6323ed~appgver_aa10a39ffbbc81919b81ce92dff14086

Deployment: appgdep_6ae576bd191881918e5ad1aa76d826a5

Deployment provider: Sites. Vercel configuration is included and the offline build was verified; no Vercel deployment is claimed.

## Pending separate evidence

Physical iPhone/Android, Safari, screen-reader walkthrough, and native Mandarin teacher pronunciation review have not been performed.

## MVP v0.5 — Vietnamese interface (2026-10-31)

Default Vietnamese plus persistent English selector; same live session survives switching. Chrome 390px/1440px: no horizontal overflow; all four modes, invalid inputs, correct/wrong feedback and translated tips, full 10-question results (9/10), missed-question review, guide/privacy and reload persistence checked. Existing 10 audio/engine groups pass; approved audio archive unchanged. No physical iOS/Safari claim. No Batcave producer/showcase propagation in this release.
