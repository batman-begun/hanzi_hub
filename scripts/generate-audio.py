import sherpa_onnx,soundfile as sf,json,pathlib,subprocess,numpy as np
# Optional build-time tool: pip install sherpa-onnx==2.0.1 soundfile numpy
# Pass a directory with model.onnx, lexicon.txt, tokens.txt; see audio-notice.txt.
import sys,shutil
root=pathlib.Path(__file__).resolve().parents[1]
voice=pathlib.Path(sys.argv[1]).resolve()
ffmpeg=shutil.which('ffmpeg')
assert ffmpeg,'Install ffmpeg before regenerating audio.'
config=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(voice/'model.onnx'),lexicon=str(voice/'lexicon.txt'),tokens=str(voice/'tokens.txt')),num_threads=2),silence_scale=.3)
assert config.validate()
tts=sherpa_onnx.OfflineTts(config)
print('Speakers:',tts.num_speakers,flush=True)
deck=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {deck} from './dist/engine.js';console.log(JSON.stringify(deck))"],cwd=root))
for i,q in enumerate(deck):
 out=root/'dist/audio'/f'{q["id"]}.m4a'
 samples=tts.generate(q['spoken']+'。',sid=66,speed=.9)
 assert len(samples.samples)>1000,q
 assert np.max(np.abs(samples.samples))>.01,q
 import tempfile
 tmp=pathlib.Path(tempfile.gettempdir())/'shu-regen-clip.wav';sf.write(tmp,samples.samples,samples.sample_rate)
 subprocess.run([ffmpeg,'-v','error','-y','-i',str(tmp),'-af','loudnorm=I=-18:TP=-2:LRA=7','-c:a','aac','-b:a','48k','-movflags','+faststart',str(out)],check=True)
 if i%12==0:print(f'{i+1}/{len(deck)}',flush=True)
print('Generated 144 open-model audio clips.',flush=True)

if tmp.exists():tmp.unlink()
