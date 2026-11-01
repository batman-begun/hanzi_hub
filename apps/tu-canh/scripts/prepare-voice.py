"""Generate missing TỪ CẢNH clips ahead of deployment; never at runtime.
Uses the approved SHÙ voice settings and verifies TLS. Stops on any error,
including provider rate limiting, and retains completed files for resumption.
"""
import json
import os
from pathlib import Path
import subprocess
import time
import requests
from gtts import gTTS

root = Path(__file__).resolve().parents[1] / 'dist'
send = requests.Session.send

def verified(session, request, **kwargs):
    kwargs['verify'] = os.environ.get('REQUESTS_CA_BUNDLE', True)
    return send(session, request, **kwargs)

requests.Session.send = verified
for quote in json.loads((root / 'quotes.json').read_text())['quotes']:
    path = root / quote['audio']
    if path.exists() and path.stat().st_size:
        continue
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.part')
    try:
        time.sleep(1)
        gTTS(quote['hanzi'], lang='zh-CN', tld='com', slow=False, timeout=(10, 30)).save(str(temp))
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(temp), '-f', 'null', '-'], check=True)
        temp.replace(path)
    except Exception:
        temp.unlink(missing_ok=True)
        raise
    print(quote['id'], flush=True)
