"""Prepare new v0.6 audio using gTTS 2.5.4. This is never called by the app/build.

Export records with: node --input-type=module -e "import('./dist/deck-v06.js').then(x=>process.stdout.write(JSON.stringify(x.newListening)))" > /tmp/shu-records.json
Then run: python scripts/generate-v06-audio.py /tmp/shu-records.json /tmp/shu-audio
"""
import json
import sys
from pathlib import Path
from gtts import gTTS

records = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
for record in records:
    path = out / f"gt-v1-{record['id']}.mp3"
    gTTS(record['spoken'], lang='zh-CN', tld='com', slow=False, timeout=20).save(str(path))
    print(record['id'], flush=True)
