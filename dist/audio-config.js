// This voice and its original normal speed were approved using the 14:05 sample.
export const AUDIO_VERSION = "gt-v1";
export const NORMAL_RATE = 1;
export const SLOW_RATE = 0.8;
export function audioSource(id) {
  if (!/^(numbers|prices|times|phones)-[0-4]-(?:[0-9]|1[01])$/.test(id)) {
    throw new RangeError("Unknown prepared audio question");
  }
  return `audio/${AUDIO_VERSION}-${id}.mp3`;
}
