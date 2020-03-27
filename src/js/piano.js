/* global d3 */
import EnterView from 'enter-view';
import Audio from './audio';
import GenerateSequence from './generate-sequence';
import './pudding-chart/notes';

const $article = d3.select('article');
const $pianos = $article.selectAll('.figure__piano');
const $buttons = $article.selectAll('.figure__restart');
const charts = {};

let data = [];
let crosswalk = [];

function filterData(condition) {
  let specificData = null;
  // separate out phases for the first few steps which repeat the same piano
  const setupPianos = ['two', 'animated', 'results', 'success'];
  if (setupPianos.includes(condition)) {
    [specificData] = data.levels.filter(d => d.title === 'Symphony No. 5 I');
  } else if (condition === 'Meryl') {
    [specificData] = data.levels.filter(d => d.title === 'Symphony No. 5  II');
  } else {
    // find which songs already have results
    const hasResults = data.levels.filter(d => d.result);

    // keep last one (presumably the one still running)
    const inProgress = hasResults.pop();

    specificData = inProgress;
  }

  return specificData;
}

function playChart({ chart, thisData, maxSequences, staticSeq }) {
  const sequences = thisData.result.recent.slice(0, maxSequences);
  const staticData = thisData.result.recent.slice(staticSeq[0], staticSeq[1]);

  // max number of sequences to keep in the DOM
  const DOM_CUTOFF = 10;
  const { tempo, sig } = thisData;

  const sequenceProgress = [];

  let seqIndex = 0;

  if (staticData.length) {
    seqIndex = staticData.length;

    staticData.forEach((seq, i) => {
      sequenceProgress.push({ index: i, notes: seq });
    });

    chart.update({ sequenceProgress, jump: true });

    const prePrinted = d3.range(staticSeq[0], staticSeq[1]);

    prePrinted.forEach(seq => {
      chart.moveSequence({ index: seq, jump: true });
    });
  }

  // handle start sequence, and moving on to new sequences
  let notesPlayed = 0;

  const playNextSequence = () => {
    sequenceProgress.push({ index: seqIndex, notes: [] });
    const sequence = sequences[seqIndex];

    Audio.play({
      sequence,
      tempo,
      sig,
      noteCallback: val => {
        // this runs for every note played
        // find the next note that needs to be played
        const note = val[notesPlayed];

        // adjust the number of notes now played
        notesPlayed += 1;

        // add this note to the sequence progress array
        const thisSeq = sequenceProgress.filter(d => d.index === seqIndex);
        thisSeq[0].notes.push(note);

        // send the new note data to be updated
        chart.update({ sequenceProgress, jump: false });

        // check if this was the last note of the sequence
        if (notesPlayed === val.length) {
          // update the sequence
          chart.moveSequence({ index: seqIndex, jump: false });
          // move onto the next sequence
          seqIndex += 1;
          // start back at 0
          notesPlayed = 0;
          // make sure that sequenceProgress never has more than 10 items in it
          const progressLength = sequenceProgress.length;
          if (progressLength > DOM_CUTOFF) sequenceProgress.shift();

          // if we haven't hit the last sequence, do this again
          if (seqIndex < sequences.length)
            setTimeout(() => playNextSequence(), 1000);
        }
      },
    });
  };

  playNextSequence();
}

function makeKeysClickable() {
  const $figure = d3.select(`[data-type='two']`);
  const $piano = $figure.select('.g-piano');
  const $activeKeys = $piano.selectAll('.active');

  $activeKeys.on('mousedown', function() {
    const key = d3.select(this);
    const midi = key.attr('data-midi');
    const match = crosswalk.find(p => +p.midi === +midi);
    const note = match ? `${match.note}${match.octave}` : null;
    Audio.clickKey(+midi);
    charts.two.pressKey({ key });
  });
}

function findChartSpecifics(condition) {
  const rend = charts[condition];
  const thisData = rend.data();
  const maxSequences = condition === 'animated' ? 1 : thisData.result.attempts;

  if (condition !== 'two') {
    if (condition === 'results')
      playChart({
        chart: rend,
        thisData,
        maxSequences: 4,
        staticSeq: [0, 1],
      });
    else if (condition === 'success') {
      const totalAttempts = thisData.result.recent.length;
      const lastStatic = totalAttempts - 3;
      playChart({
        chart: rend,
        thisData,
        maxSequences,
        staticSeq: [0, lastStatic],
      });
    } else if (condition === 'Meryl')
      playChart({
        chart: rend,
        thisData,
        maxSequences: 5,
        staticSeq: [0, 0],
      });
    else playChart({ chart: rend, thisData, maxSequences, staticSeq: [0, 0] });
  } else makeKeysClickable();
}

function setupEnterView() {
  EnterView({
    selector: '.figure__piano',
    enter(el, i) {
      // pause other charts
      Object.keys(charts).map(d => {
        // const val = charts[d];
        Audio.stop();
      });

      // select the currently entered chart and update/play it
      const condition = d3.select(el).attr('data-type');

      if (condition !== 'all') {
        // no enter view for select chart
        charts[condition].clear();
        findChartSpecifics(condition);
      }
    },
    exit(el, i) {
      Object.keys(charts).map(d => {
        Audio.stop();
      });
    },
    offset: 0.6,
    once: false,
  });
}

function setupRestartButtons() {
  $buttons.on('click', function(d) {
    const clicked = d3.select(this);
    const type = clicked.attr('data-type');
    const chart = charts[type];
    chart.clear();
    findChartSpecifics(type);
  });
}

function setupCharts() {
  const $sel = d3.select(this);
  const condition = $sel.attr('data-type');
  const specificData = filterData(condition);

  const chart = $sel.data([specificData]).noteChart();
  chart.resize().render();
  charts[condition] = chart;
}

function setupDropdown(data) {
  const dd = $article.select('.figure__dropdown');
  const levels = data.levels.map(d => d.title);
  dd.selectAll('option')
    .data(levels)
    .join(enter =>
      enter
        .append('option')
        .attr('value', d => d)
        .text(d => d)
    );

  dd.on('change', function() {
    const sel = d3.select(this).property('value');

    const song = data.levels.find(d => d.title === sel);
    const seq = GenerateSequence(song);
    // TODO play ^ seq

    charts.all.clear();

    charts.all
      .data(song)
      .resize()
      .render();
  });
}

function init({ levels, cw }) {
  data = levels;
  crosswalk = cw;
  // scroll triggers
  $pianos.each(setupCharts);
  setupEnterView();
  setupRestartButtons();
  setupDropdown(data);
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize };
