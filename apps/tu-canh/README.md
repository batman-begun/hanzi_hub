# TỪ CẢNH / 词境 — MND-002

Mandarin quote-art player. Canonical code: `batman-begun/hanzi_hub/apps/tu-canh`.
Independent Sites producer: https://tu-canh.batmanbegun.chatgpt.site . Owner-private audience retained. SHÙ root app and deployment are independent.

## Current release: private prototype 0.2.0

20 original practice sentences, target 300. Eight public-domain Chinese/Japanese artworks (Met Open Access) are reused editorially across the pilot. This historical-art pilot is NOT the final modern East/Southeast Asian photography/AI-art library. All sentences/pinyin/translations require founder/teacher review; HSK1–6 is an editorial ceiling, not a certified vocabulary audit.

Full mobile viewport without browser fullscreen; tap/keyboard reveals Nghe / Câu tiếp / Tải ảnh. Independent translucent music toggle upper right. First interaction starts music; music persists between quotes, pauses during voice, resumes after voice, but never overrides a manual music pause. Hidden-tab audio suspends. Shuffle visits unseen quotes and prefers different image/mood/topic. Screen typography reflows independently of photo crop; download files have baked text and selected watermark A, bottom-left. Master resolution is limited by original cropped pixels, never upscaled. Information dialog preserves artwork provenance and music attribution.

**Voice blocker:** Google returned HTTP 429 on 2026-11-01 for the SHÙ-equivalent generation pipeline. Twenty quote clips are `pending_provider`, not silently replaced with browser voices. Nghe reports this state. Actual Mandarin playback and subjective pronunciation QA remain open. Audio director is tested with media doubles, not claimed as an all-clip audio pass.

## Code and media boundaries

GitHub contains application code, structured content/provenance, regeneration tools, and QA. Prepared high-res media is retained in the separate Sites source repository/deployment; it is not licensed under the root code license. `content/media-manifest.json` records exact prepared bytes. No runtime AI, TTS, image search, external API key or paid subscription.

## Check / reproduce

`node test.mjs` runs source tests (no media downloads). `node scripts/check-assets.mjs` checks prepared media. Static root: `dist/`.

To rebuild imagery, install Pillow and requests in an isolated Python environment, then run `python scripts/fetch-pilot-art.py` and `python scripts/fetch-dependencies.py`. Set `TU_CANH_CJK_FONT` and `TU_CANH_LATIN_FONT` for font locations (default CJK `content/NotoSerifCJKsc-Regular.otf`, default Latin DejaVu Serif). Run `python scripts/render-artworks.py` then `python scripts/prepare-display.py`. Ordinary deployment uses already-prepared files and requires no generation.

Optional voice generation uses gTTS==2.5.4, zh-CN/com/slow=False, normal1.0, same as founder-approved SHÙ reference. `python scripts/prepare-voice.py` verifies TLS using the environment CA bundle. Do not bypass rate limits or certificates. After generation: decode all clips, review pronunciation, set each exact audio SHA and `audio_status=ready` only after verification. Browser speech is deliberately not a fallback.

## Rights

“The Miracle of Flight” by Scott Buckley — released under CC BY 4.0. https://www.scottbuckley.com.au/library/the-miracle-of-flight/ ; https://creativecommons.org/licenses/by/4.0/ . Playback looping/volume changes/pause implemented; original file untranscoded. Included attribution is accessible from ⓘ.

Art sources: `content/art-sources.json`; public-domain images from The Metropolitan Museum of Art Open Access. Cropped and overlaid with original quote typography. Watermark identifies TỪ CẢNH composition, not ownership of underlying paintings. AI/stock sources with unclear download redistribution rights are excluded from this pilot. Noto CJK fonts use SIL OFL (bootstrap retrieves notice); DejaVu fonts retain their own license. Source artwork cultural attribution is preserved.
