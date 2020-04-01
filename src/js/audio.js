import Tone from 'tone';
import samples from './samples.json';
import midiToNotation from './midi-to-notation';

let sampler;
let part = new Tone.Part(() => {}, []);
Tone.Master.mute = true;
let current;

function stop(chart) {
  // console.log({ current, chart });
  if (!chart || current === chart) Tone.Transport.stop();
}

function mute(condition) {
  Tone.Master.mute = condition;
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

function play({ sequence, tempo, swapFn, noteCallback, condition }) {
  stop();
  current = condition;
  part.removeAll();
  const s = sequence.map(d => ({ midi: d[0], duration: swapFn(d[1]) }));
  const results = midiToNotation(s);
  const values = results.notesNoRests;
  const original = results.originalNotes;
  part = new Tone.Part((time, value) => {
    noteCallback(original);
    sampler.triggerAttackRelease(value.note, value.duration, time);
  }, values).start(0);
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.timeSignature = 4;
  Tone.Transport.start();
}

function init(cb) {
  sampler = new Tone.Sampler(samples, {
    release: 0.5,
    baseUrl: 'assets/notes/',
    onload: cb,
  }).toMaster();
}

export default { init, play, stop, clickKey, mute };
