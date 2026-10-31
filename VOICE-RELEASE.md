# Google Translate voice release

Founder approved the exact reference: 14:05 / 十四点零五分.
Approval quote: “chốt, hài lòng 100%!!! apply vioice này cho product!!!!”

Replaces the original Icefall AISHELL-3 bank with 144 prepared MP3 clips from
Google Translate speech via gTTS 2.5.4, zh-CN / com / slow=False. The approved
reference is included unchanged. Original returned files are not stretched,
pitch-shifted, normalized, transcoded or re-punctuated. All modes/levels use
normal playback 1.0; optional slow replay uses 0.8 with pitch preservation.

Assets are packaged for offline builds and local playback. No runtime TTS/API,
API key, Google Cloud billing, or extra provider dependency is introduced.
Versioned audio names and the entry module URL prevent mixing cached old audio.

Technical verification: every clip fully decoded, SHA-256 linked to its question
text/answer, 10 test groups passed, Chrome mobile 390px matrix all 12 mode/level
combinations reached readyState 4 with finite duration, original rate 1.0 and
correct answer feedback. Default playback for phones is no longer artificially
slowed or accelerated. Original release history is retained in QA.md.

Limits: reference-voice approval is owner feedback, not individual native-teacher
QA of all 144 pronunciations. gTTS is a third-party client of undocumented
Translate speech functionality; future regeneration can fail independently of
this deployed prepared audio bank.

Rollback: retain the exact prior Sites v2 saved version:
appgprj_6ae5731f39748191b6cc51b09e6323ed~appgver_aa10a39ffbbc81919b81ce92dff14086
