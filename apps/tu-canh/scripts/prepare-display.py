"""Create responsive scene backgrounds and watermark A; download masters are
produced separately by render-artworks.py. Requires Pillow and CJK font.
"""
import json,pathlib,os
from PIL import Image,ImageOps,ImageFont,ImageDraw
p=pathlib.Path(__file__).resolve().parents[1]
cn=os.environ.get('TU_CANH_CJK_FONT',str(p/'content/NotoSerifCJKsc-Regular.otf'))
la=os.environ.get('TU_CANH_LATIN_FONT','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')
d=json.loads((p/'dist/quotes.json').read_text())
for q in d['quotes']:
 i=q['source']['id'];im=Image.open(p/f'content/met-{i}.jpg').convert('RGB');w=min(1080,im.width,int(im.height*9/16));h=int(w*16/9);im=ImageOps.fit(im,(w,h),method=Image.Resampling.LANCZOS);name=f'assets/scene-{i}.webp';im.save(p/'dist'/name,quality=88);q['scene_image']=name
(p/'dist/quotes.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
im=Image.new('RGBA',(600,150));dr=ImageDraw.Draw(im);ink='#eee6d4';dr.rounded_rectangle((5,10,130,135),radius=4,outline=ink,width=3);dr.text((20,17),'词',font=ImageFont.truetype(cn,47),fill=ink);dr.text((68,68),'境',font=ImageFont.truetype(cn,47),fill=ink);dr.text((165,9),'Từ Cảnh',font=ImageFont.truetype(la,65),fill=ink);dr.text((170,93),'词 境',font=ImageFont.truetype(cn,31),fill=ink);im.save(p/'dist/assets/watermark-a.png')
