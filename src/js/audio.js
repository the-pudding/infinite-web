import Tone from 'tone';
import EnterView from 'enter-view';
import samples from './samples.json';
import midiToNotation from './midi-to-notation';
import piano from './piano';

let charts = {};

function setupChartEnter() {
  EnterView({
    selector: '.figure__piano',
    enter(el, i) {
      // pause other charts
      Object.keys(charts).map(d => {
        const val = charts[d];
        console.log({ val, d });
        // val.pause();
      });

      // select the currently entered chart and update/play it
      const condition = d3.select(el).attr('data-type');
      const rend = charts[condition];
      rend.update();
    },
    offset: 0.25,
    once: true,
  });
}

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

function init() {
  //
  piano.importCharts().then(chartFunctions => {
    charts = chartFunctions.charts;
    setupChartEnter();
  });
}

export default init;
