import { gunzipSync } from "node:zlib";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Prepared audio and open fonts ship in one archive. No network or TTS at build time.
const root = new URL("./", import.meta.url);
const assets = JSON.parse(
  gunzipSync(readFileSync(new URL("assets.json.gz", root))),
);
for (const [path, base64] of Object.entries(assets)) {
  if (!/^dist\/(audio|fonts)\/[a-zA-Z0-9._-]+$/.test(path)) {
    throw new Error(`Invalid asset path: ${path}`);
  }
  const target = new URL(path, root);
  mkdirSync(dirname(target.pathname), { recursive: true });
  writeFileSync(target, Buffer.from(base64, "base64"));
}
if (Object.keys(assets).length !== 150)
  throw new Error("Incomplete prepared assets");
console.log(
  "SHÙ ready: 144 audio clips and 6 font files/notices restored to dist/.",
);
