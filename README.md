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
- Synthetic Mandarin clips generated offline using an Apache-2.0 model. About 1.73 MB of audio total; each question loads only its own clip.
- Correct/incorrect feedback with characters, dictionary-tone pinyin, a short pattern explanation, and missed-question review.
- Local progress with a clear-data control. No accounts, analytics, ad scripts, microphone access, secrets, or paid API calls.
- Locally hosted fonts. Responsive layout, visible keyboard focus, labelled inputs, reduced-motion support, keyboard submission, and status announcements.

## Run and verify

Node 18+ and Python 3 for the local preview. No package installation required.

```sh
npm test
npm run dev
```

Open http://localhost:4173. `npm run build` restores 144 audio clips and the fonts from the included `assets.json.gz` into `dist/`. No network, model download, or API key is required. `npm run dev` does this automatically.

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

## Limits and honest scope

This is a focused listening MVP, not a full Mandarin course or proficiency test. Sessions sample a finite bank; there is no claim of unlimited new audio. Synthetic pronunciation and tone sandhi have not received a native teacher's review. Pinyin shows dictionary tones. The price workout uses explicit textbook currency units rather than every conversational variant (块, 毛, omitted units). Time answers use the 24-hour clock. Generated phone strings are practice content and must not be dialed; they are not checked against assigned real-world phone numbers.

Browser QA uses Chrome at desktop and emulated mobile viewport sizes. Physical iPhone/Android and Safari testing remain separate checks.

## Credits

Audio model: [Icefall AISHELL-3 VITS](https://huggingface.co/csukuangfj/icefall-tts-aishell3-vits-low-2024-04-06), Apache-2.0. Generated with [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), speaker 66. Full audio provenance: `dist/audio-notice.txt`. Fonts: DM Sans and Manrope, SIL OFL 1.1, notices included in `dist/fonts/`.

Code: MIT. Third-party assets retain their respective notices.
