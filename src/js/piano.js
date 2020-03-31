/* global d3 */
import jump from 'jump.js';
import EnterView from 'enter-view';
import Audio from './audio';
import GenerateSequence from './generate-sequence';
import './pudding-chart/notes';

const $article = d3.select('article');
const $pianos = $article.selectAll('.figure__piano');
const $buttons = $article.selectAll('.figure__restart');
const $correct = $article.selectAll('.figure__correct');
const charts = {};

let data = [];
let crosswalk = [];
let cwMapNote = [];

let generatedData = {};

// keep track of how far into this, the live chart has gone
let liveChartCount = 0;

function filterData(condition) {
  let specificData = null;
  // separate out phases for the first few steps which repeat the same piano
  const setupPianos = ['two', 'animated', 'results', 'success', 'all'];
  if (setupPianos.includes(condition)) {
    [specificData] = data.levels.filter(d => d.title === 'Symphony No. 5 I');
  } else if (condition === 'beethoven2') {
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

function findDuration(tempo, duration) {
  // const BPM = data.tempo;
  const minute = 60000;
  const BEAT_LENGTH = Math.floor(minute / tempo);
  const newDur = Math.floor(BEAT_LENGTH * (4 / 2 ** duration));
  return newDur;
}

function playChart({ chart, thisData, maxSequences, staticSeq, condition }) {
  // add note data to played tones
  thisData.result.recent.forEach(seq => {
    seq.forEach(tone => {
      const note = cwMapNote.get(tone[0]);
      tone.push(note);
      return tone;
    });
    return seq;
  });

  const { attempts } = thisData.result;

  console.log({ thisData });

  const sequences = thisData.result.recent.slice(
    maxSequences[0],
    maxSequences[1]
  );
  const staticData = thisData.result.recent.slice(staticSeq[0], staticSeq[1]);

  // max number of sequences to keep in the DOM
  const DOM_CUTOFF = 10;
  const { tempo, swap } = thisData;
  const swapFn = d => {
    if (!swap) return d;
    const [f, r] = swap.split('-').map(v => +v);
    return d === f ? r : d;
  };

  const sequenceProgress = [];

  let seqIndex = 0;

  if (staticData.length) {
    seqIndex = staticData.length;

    staticData.forEach((seq, i) => {
      sequenceProgress.push({ index: i, notes: seq, attempts: attempts + i });
    });

    chart.update({ sequenceProgress, jump: true, condition });

    const prePrinted = d3.range(staticSeq[0], staticSeq[1]);

    prePrinted.forEach(seq => {
      chart.moveSequence({ index: seq, jump: true, duration: 0 });
    });
  }

  // handle start sequence, and moving on to new sequences
  let notesPlayed = 0;

  const playNextSequence = () => {
    sequenceProgress.push({
      index: seqIndex,
      notes: [],
      attempts: attempts + seqIndex,
    });
    const sequence = sequences[seqIndex];
    Audio.play({
      chart,
      sequence,
      tempo,
      swapFn,
      condition,
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
        chart.update({ sequenceProgress, jump: false, condition });

        // check if this was the last note of the sequence
        if (notesPlayed === val.length) {
          const finalDuration = findDuration(tempo, note[1]);
          chart.moveSequence({
            index: seqIndex,
            jump: false,
            duration: finalDuration,
          });
          // move onto the next sequence
          seqIndex += 1;

          // if this is the live chart, update the live chart count
          if (condition === 'live') liveChartCount += 1;

          // start back at 0
          notesPlayed = 0;
          // make sure that sequenceProgress never has more than 10 items in it
          const progressLength = sequenceProgress.length;
          if (progressLength > DOM_CUTOFF) sequenceProgress.shift();

          // if we haven't hit the last sequence, do this again
          if (seqIndex < sequences.length)
            setTimeout(() => playNextSequence(), finalDuration + 500);
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
  const maxSequences =
    condition === 'animated' ? [0, 1] : [0, thisData.result.attempts];

  if (condition === 'results')
    playChart({
      chart: rend,
      thisData,
      maxSequences: [0, 4],
      staticSeq: [0, 1],
      condition,
    });
  else if (condition === 'success') {
    const totalAttempts = thisData.result.recent.length;
    const lastStatic = totalAttempts - 3;
    playChart({
      chart: rend,
      thisData,
      maxSequences,
      staticSeq: [0, lastStatic],
      condition,
    });
  } else if (condition === 'beethoven2')
    playChart({
      chart: rend,
      thisData,
      maxSequences: [
        thisData.result.recent.length - 5,
        thisData.result.recent.length,
      ],
      staticSeq: [0, 0],
      condition,
    });
  else if (condition === 'live') {
    const toCut = liveChartCount < 10;
    const totalAttempts = thisData.result.recent.length;
    playChart({
      chart: rend,
      thisData,
      maxSequences: toCut
        ? [0, totalAttempts]
        : [liveChartCount - 10, totalAttempts],
      staticSeq: [liveChartCount - 10, liveChartCount],
      condition,
    });
  } else
    playChart({
      chart: rend,
      thisData,
      maxSequences,
      staticSeq: [0, 0],
      condition,
    });
}

function setupEnterView() {
  EnterView({
    selector: '.figure__piano',
    enter(el) {
      // select the currently entered chart and update/play it
      const condition = d3.select(el).attr('data-type');
      Audio.stop();
      if (condition !== 'all' && condition !== 'two') {
        // no enter view for select chart
        charts[condition].clear();
        findChartSpecifics(condition);
      }
    },
    exit(el) {
      Audio.stop();
    },
    offset: 0.6,
    once: false,
  });
}
function handleAllClick(btn) {
  const song = data.levels.find(d => d.title === generatedData.title);

  const correctSeq = song.sequence.map(d => [d.midi, d.duration]);
  const seq = btn === 'correct' ? correctSeq : GenerateSequence(song);
  generatedData.result.recent.push(seq);

  const recentLength = generatedData.result.recent.length;

  playChart({
    chart: charts.all,
    thisData: generatedData,
    maxSequences: [0, recentLength],
    staticSeq: [0, recentLength > 0 ? recentLength - 1 : 0],
    condition: 'all',
  });
}

function setupRestartButtons() {
  // update text on last button
  const finalButton = $buttons
    .filter((d, i, n) => {
      return d3.select(n[i]).attr('data-type') === 'all';
    })
    .text('Generate Attempt');
  $buttons.on('click', function() {
    const clicked = d3.select(this);
    const type = clicked.attr('data-type');
    const chart = charts[type];
    chart.clear();
    if (type === 'all') {
      handleAllClick('generate');
    } else findChartSpecifics(type);
  });

  $correct.on('click', function(d) {
    charts.all.clear();
    handleAllClick('correct');
  });
}

function setupCharts() {
  const $sel = d3.select(this);
  const condition = $sel.attr('data-type');
  const specificData = filterData(condition);

  const chart = $sel.data([specificData]).noteChart();
  chart.resize().render();
  charts[condition] = chart;

  if (condition === 'two') makeKeysClickable();
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

  // make default dd the default for generated data
  const defaultSong = data.levels.find(d => d.title === levels[0]);
  generatedData = {
    title: defaultSong.title,
    tempo: defaultSong.tempo,
    result: { recent: [] },
  };

  dd.on('change', function() {
    Audio.stop();
    const sel = d3.select(this).property('value');

    const song = data.levels.find(d => d.title === sel);
    const seq = GenerateSequence(song);

    generatedData = {
      title: song.title,
      tempo: song.tempo,
      sig: song.sig,
      result: { recent: [seq] },
    };

    charts.all.clear();

    charts.all
      .data(song)
      .resize()
      .render();

    playChart({
      chart: charts.all,
      thisData: generatedData,
      maxSequences: [0, 1],
      staticSeq: [0, 0],
      condition: 'all',
    });

    jump(this, { offset: -64, duration: 500 });
  });
}

function setupNoteMap() {
  const cwData = crosswalk.map(d => [d.midi, d.note]);
  cwMapNote = new Map(cwData);
}

function init({ levels, cw }) {
  data = levels;
  crosswalk = cw;
  setupNoteMap();
  Audio.init(() => {
    // scroll triggers
    $pianos.each(setupCharts);
    setupEnterView();
    setupRestartButtons();
    setupDropdown(data);
  });
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize };
