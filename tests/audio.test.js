import { test } from "node:test";
import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { deck } from "../dist/engine.js";
import { audioSource, NORMAL_RATE, SLOW_RATE } from "../dist/audio-config.js";

test("every question uses the approved voice bank, matching its exact spoken text", () => {
  const assets = JSON.parse(
    gunzipSync(readFileSync(new URL("../assets.json.gz", import.meta.url))),
  );
  const manifest = JSON.parse(
    readFileSync(new URL("../dist/audio-manifest.json", import.meta.url)),
  );
  assert.equal(manifest.lang, "zh-CN");
  assert.equal(manifest.tld, "com");
  assert.equal(manifest.slow, false);
  assert.equal(manifest.postprocessing, "none");
  assert.equal(manifest.clips.length, 144);
  assert.equal(new Set(manifest.clips.map((c) => c.id)).size, 144);
  for (const q of deck) {
    const clip = manifest.clips.find((c) => c.id === q.id);
    assert.equal(clip.text, q.spoken);
    assert.equal(clip.answer, q.answer);
    const path = "dist/" + audioSource(q.id);
    assert.equal(path, "dist/audio/" + clip.file);
    assert.ok(assets[path], q.id);
    const bytes = Buffer.from(assets[path], "base64");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), clip.sha256);
    assert.ok(clip.duration > 0.2);
  }
  assert.ok(!Object.keys(assets).some((p) => p.endsWith(".m4a")));
  const reference = Buffer.from(
    assets["dist/audio/gt-v1-reference-14-05.mp3"],
    "base64",
  );
  assert.equal(
    createHash("sha256").update(reference).digest("hex"),
    "033c9f13c1d75f255e1aea7094225c72e681e5061d957c99f46088c269c6e470",
  );
});

test("normal playback preserves the approved pace across all modes and levels", () => {
  assert.equal(NORMAL_RATE, 1);
  assert.equal(SLOW_RATE, 0.8);
  for (const q of deck)
    assert.match(audioSource(q.id), /^audio\/gt-v1-.+\.mp3$/);
  assert.throws(() => audioSource("../legacy"), RangeError);
});
