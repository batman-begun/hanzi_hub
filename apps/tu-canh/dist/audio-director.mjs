// A single owner for both media elements. Explicit music intent survives voice
// interruptions; stale asynchronous play() completions cannot revive old audio.
export class AudioDirector {
 constructor(music,voice,{wanted=true,onState=()=>{},onError=()=>{}}={}){Object.assign(this,{music,voice,wanted,onState,onError});this.started=false;this.suspended=false;this.speaking=false;this.musicEpoch=0;this.voiceEpoch=0;music.volume=.25;}
 unlock(){this.started=true;return this.sync();}
 toggle(){this.started=true;this.wanted=!this.wanted;this.sync();return this.wanted;}
 async sync(){const epoch=++this.musicEpoch;const should=this.started&&this.wanted&&!this.speaking&&!this.suspended;if(!should){this.music.pause();this.onState(this);return;}try{await this.music.play();if(epoch!==this.musicEpoch){if(!(this.started&&this.wanted&&!this.speaking&&!this.suspended))this.music.pause();return;}this.onState(this);}catch(e){if(epoch===this.musicEpoch){this.onState(this);this.onError('music',e);}}}
 async speak(src){this.started=true;this.voice.pause();this.voice.currentTime=0;const token=++this.voiceEpoch;this.speaking=true;this.sync();this.voice.src=src;this.onState(this);this.voice.onended=()=>this.finish(token);this.voice.onerror=()=>{if(token===this.voiceEpoch){this.onError('voice');this.finish(token);}};try{await this.voice.play();if(token!==this.voiceEpoch&&!this.speaking)this.voice.pause();}catch(e){if(token===this.voiceEpoch){this.onError('voice',e);this.finish(token);}}}
 finish(token){if(token!==this.voiceEpoch)return;this.speaking=false;this.onState(this);this.sync();}
 stopVoice(){this.voiceEpoch++;this.voice.pause();this.voice.onended=null;this.voice.onerror=null;this.speaking=false;this.onState(this);this.sync();}
 suspend(value){this.suspended=value;if(value)this.stopVoice();this.sync();}
}
