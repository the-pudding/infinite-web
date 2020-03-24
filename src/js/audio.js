import Tone from 'tone';
import samples from './samples.json';
import midiToNotation from './midi-to-notation';

let part = new Tone.Part(() => {}, []);

const sampler = new Tone.Sampler(samples, {
  release: 0.5,
  baseUrl: 'assets/notes/',
}).toMaster();

function stop() {
  // make sure there is a transport to stop
  Tone.Transport.stop();
}

function play({ sequence, tempo, sig, noteCallback }) {
  stop();
  part.removeAll();
  const values = midiToNotation(sequence);
  part = new Tone.Part((time, value) => {
    noteCallback(value);
    sampler.triggerAttackRelease(value.note, value.duration, time);
  }, values).start(0);
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.timeSignature = sig || 4;
  Tone.Transport.start();
}

export default { play, stop };
