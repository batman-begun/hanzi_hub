"""Optional preparation tool; ordinary builds need no network or TTS dependency.
Install gTTS==2.5.4 and requests in a separate environment. Requires ffmpeg/ffprobe.
Matches the owner-approved zh-CN/com/slow=False reference. No paid API or key.
"""
import json
import pathlib
import subprocess
import time

import requests
from gtts import gTTS

root = pathlib.Path(__file__).resolve().parents[1]
deck = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    "import {deck} from './dist/engine.js';console.log(JSON.stringify(deck))"
], cwd=root))
original_send = requests.Session.send


def verified_send(self, request, **kwargs):
    kwargs['verify'] = True
    return original_send(self, request, **kwargs)


requests.Session.send = verified_send
out = root / 'dist/audio'
out.mkdir(parents=True, exist_ok=True)
for question in deck:
    path = out / ('gt-v1-' + question['id'] + '.mp3')
    if path.exists():
        continue
    gTTS(question['spoken'], lang='zh-CN', tld='com', slow=False,
         timeout=(10, 30)).save(str(path))
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'null', '-'],
                   check=True)
    time.sleep(.25)
print('Prepared 144 practice MP3 clips. Repack assets.json.gz before release.')
