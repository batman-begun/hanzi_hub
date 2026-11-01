import requests,json,pathlib,concurrent.futures
p=pathlib.Path(__file__).resolve().parents[1]
ids=[54677,54701,72711,54114,56070,37325,56385,56240]
def get(i):
 try:
  r=requests.get(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{i}',timeout=20);r.raise_for_status();o=r.json()
  if not o.get('isPublicDomain') or not o.get('primaryImage'):return {'id':i,'error':'not downloadable PD'}
  b=requests.get(o['primaryImage'],timeout=30);b.raise_for_status();(p/f'content/met-{i}.jpg').write_bytes(b.content)
  return {'id':i,'title':o['title'],'artist':o['artistDisplayName'],'source':o['objectURL'],'image':o['primaryImage'],'license':'Public Domain / Met Open Access','checked_at':'2026-11-01','file':f'content/met-{i}.jpg'}
 except Exception as e:return {'id':i,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:r=list(ex.map(get,ids))
(p/'content/art-sources.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps(r,ensure_ascii=False))
