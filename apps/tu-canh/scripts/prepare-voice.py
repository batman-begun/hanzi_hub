"""Optional prebuild only. gTTS==2.5.4 zh-CN/com/slow=False, same as SHÙ.
No TTS at runtime. Preserve returned audio bytes; no speed/pitch processing.
"""
import json,pathlib,subprocess,requests,os
from gtts import gTTS
p=pathlib.Path(__file__).resolve().parents[1]
send=requests.Session.send
def verified(self,request,**kw):
 kw['verify']=os.environ.get('REQUESTS_CA_BUNDLE',True)
 return send(self,request,**kw)
requests.Session.send=verified
for q in json.loads((p/'dist/quotes.json').read_text())['quotes']:
 path=p/'dist'/q['audio']
 if path.exists() and path.stat().st_size:continue
 gTTS(q['hanzi'],lang='zh-CN',tld='com',slow=False,timeout=(10,30)).save(str(path))
 subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True)
 print(q['id'],flush=True)
