import Tone from 'tone';
import samples from './samples.json';
import midiToNotation from './midi-to-notation';

let part = new Tone.Part(() => {}, []);

const sampler = new Tone.Sampler(samples, {
  release: 0.5,
  baseUrl: 'assets/notes/',
}).toMaster();

// setup synth for clickable keyboard
const synth = new Tone.Synth();
// set the tone to sine
synth.oscillator.type = 'sine';
// connect to master output
synth.toMaster();

function stop() {
  // make sure there is a transport to stop
  Tone.Transport.stop();
}

function clickKey(midi) {
  stop();
  part.removeAll();
  // const s = sequence.map(d => ({ midi: d[0], duration: d[1] }));
  const results = midiToNotation([{ midi, duration: 3 }]);
  const values = results.notesNoRests;
  part = new Tone.Part((time, value) => {
    sampler.triggerAttackRelease(value.note, value.duration, time);
  }, values).start(0);
  Tone.Transport.bpm.value = 80;
  Tone.Transport.timeSignature = 4;
  Tone.Transport.start();
}

function play({ sequence, tempo, sig, noteCallback }) {
  stop();
  part.removeAll();
  const s = sequence.map(d => ({ midi: d[0], duration: d[1] }));
  const results = midiToNotation(s);
  const values = results.notesNoRests;
  const original = results.originalNotes;
  part = new Tone.Part((time, value) => {
    noteCallback(original);
    sampler.triggerAttackRelease(value.note, value.duration, time);
  }, values).start(0);
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.timeSignature = sig || 4;
  Tone.Transport.start();
}

export default { play, stop, clickKey };
