"""Optional media/font bootstrap; no services are contacted at user runtime."""
from pathlib import Path
import urllib.request
p=Path(__file__).resolve().parents[1]
items={
 'dist/assets/miracle-of-flight.mp3':'https://www.scottbuckley.com.au/library/wp-content/uploads/2020/08/sb_themiracleofflight.mp3',
 'content/NotoSerifCJKsc-Regular.otf':'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/SimplifiedChinese/NotoSerifCJKsc-Regular.otf',
 'content/Noto-OFL.txt':'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/LICENSE'}
for target,url in items.items():
 f=p/target
 if f.exists() and f.stat().st_size:continue
 f.parent.mkdir(parents=True,exist_ok=True)
 with urllib.request.urlopen(url,timeout=60) as r:f.write_bytes(r.read())
 print(target)
