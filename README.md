# SHÙ 数字 — Mandarin Number Gym

**Know the words. Catch the numbers.**

A mobile-first listening gym for the Mandarin numbers that pass you by in real life: a market price, a departure time, an eleven-digit phone number. Ten-question workouts, instant feedback, Chinese characters and pinyin, slow replay, and a second round for missed questions.

## Try it

Production target: https://shu-mandarin-number-gym.batmanbegun.chatgpt.site

Public reachability is recorded separately in QA.md after deployment verification.

## What ships

- Four workouts: numbers, prices, 24-hour times, and fictional phone strings.
- Three levels and 144 prepared audio questions: 12 per workout/level, shuffled into ten-question sessions.
- Numbers from 0 to 99,999, explicit 元 / 角 / 分 prices, missing-place 零, and phone 幺.
- Prepared Google Translate Mandarin MP3 clips using the owner-approved zh-CN/com/normal-speed settings. Original returned audio is preserved; each question loads only its own clip.
- Correct/incorrect feedback with characters, dictionary-tone pinyin, a short pattern explanation, and missed-question review.
- Local progress with a clear-data control. No accounts, analytics, ad scripts, microphone access, secrets, or paid API calls.
- Locally hosted fonts. Responsive layout, visible keyboard focus, labelled inputs, reduced-motion support, keyboard submission, and status announcements.

## Run and verify

Node 18+ and Python 3 for the local preview. No package installation required.

```sh
npm test
npm run dev
```

Open http://localhost:4173. `npm run build` restores 144 practice clips, the approved reference clip and the fonts from the included `assets.json.gz` into `dist/`. No network, model download, or API key is required. `npm run dev` does this automatically.

## Deploy

Vercel: import this repository, choose **Other**, and use the included `vercel.json`. No environment variables are needed. The static site is also portable to any ordinary static host. Sites deployment metadata lives in `.openai/hosting.json` and is not required for Vercel.

GitHub Pages: the repository includes a manual `workflow_dispatch` workflow to deploy `dist/`. The repository owner must select GitHub Actions as the Pages source if it is not enabled. The workflow is not triggered on every push.

## Structure

`dist/index.html` — app shell and field notes

`dist/style.css` — responsive design and locally hosted fonts

`dist/engine.js` — pure number/price/time/phone generation and answer normalization

`dist/app.js` — workout state, audio, feedback, review, local progress

`assets.json.gz` — prepared synthetic speech and fonts, restored into `dist/` at build time

`build.js` — dependency-free, offline asset restoration

`tests/engine.test.js` — edge cases, full numeric range structural invariants, balanced deck, answer roundtrips

## Approved Google Translate voice

The owner approved the exact 14:05 / 十四点零五分 reference on 2026-10-31. The reference is included unchanged at `dist/audio/gt-v1-reference-14-05.mp3`. All workouts and levels use original 1.0 playback; optional slow replay uses pitch-preserving 0.8. Prepared audio assets have versioned names so an older browser cache cannot mix the previous voice into a new workout. A voice reference approval is not a claim of individual native-teacher review of every clip.

## Limits and honest scope

This is a focused listening MVP, not a full Mandarin course or proficiency test. Sessions sample a finite bank; there is no claim of unlimited new audio. Synthetic pronunciation and tone sandhi have not received a native teacher's review. Pinyin shows dictionary tones. The price workout uses explicit textbook currency units rather than every conversational variant (块, 毛, omitted units). Time answers use the 24-hour clock. Generated phone strings are practice content and must not be dialed; they are not checked against assigned real-world phone numbers.

Browser QA uses Chrome at desktop and emulated mobile viewport sizes. Physical iPhone/Android and Safari testing remain separate checks.

## Credits

Audio source: Google Translate speech via [gTTS 2.5.4](https://github.com/pndurette/gTTS), zh-CN, com, slow=False. This third-party client is not Google Cloud TTS and future regeneration depends on undocumented upstream functionality. Playback uses packaged files and never calls that service. Full audio provenance: `dist/audio-notice.txt`. Fonts: DM Sans and Manrope, SIL OFL 1.1, notices included in `dist/fonts/`.

Code: MIT. Third-party assets retain their respective notices.

## MVP v0.5 — Vietnamese UI

Vietnamese is the default interface; the header offers English. Language choice is stored locally. Switching translates current feedback/results without restarting the session, changing answers, audio or progress. Numbers/prices/time input conventions are explained in Vietnamese. Browser checks cover phone-width/desktop, all exercise modes, wrong/correct answers, full session/results/review, guide and language persistence. Physical iOS/Safari QA is not claimed.
