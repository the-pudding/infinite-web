import Tone from 'tone';
import samples from './samples.json';
import midiToNotation from './midi-to-notation';

const sampler = new Tone.Sampler(samples, {
  release: 0.5,
  baseUrl: 'assets/notes/',
}).toMaster();

let part = new Tone.Part(() => {}, []);

function generateAudio(sequence, tempo, sig) {
  Tone.Transport.stop();
  part.removeAll();
  const values = midiToNotation(sequence);
  part = new Tone.Part((time, value) => {
    console.log(time, value.note, value.duration);
    sampler.triggerAttackRelease(value.note, value.duration, time);
  }, values).start(0);
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.timeSignature = sig || 4;
  Tone.Transport.start();
}

export default generateAudio;
