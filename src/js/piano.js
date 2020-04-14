/* global d3 */
import jump from 'jump.js';
import EnterView from 'enter-view';
import Audio from './audio';
import GenerateSequence from './generate-sequence';
import './pudding-chart/notes';
import replaySvg from './replay-svg';

const $article = d3.select('article');
const $pianos = $article.selectAll('.figure__piano');
const $buttons = $article.selectAll('.figure__restart');
const $correct = $article.selectAll('.figure__correct');
const $closest = $article.selectAll('.figure__closest');
const charts = {};

let data = [];
let crosswalk = [];
let cwMapNote = [];
let generatedData = {};

let statusDone = false;

// keep track of how far into this, the live chart has gone
let liveChartCount = 0;

let pauseTimeout = null;

function stop(chart) {
  Audio.stop(chart);
  if (chart && charts[chart]) {
    charts[chart].clear();
    clearTimeout(pauseTimeout);
  } else {
    // console.log({ charts });
    Object.keys(charts).forEach(c => charts[c].clear());
  }
}

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
  const resultLength = thisData.result.recent.length;
  // add note data to played tones
  thisData.result.recent.forEach(seq => {
    seq.forEach(tone => {
      if (tone.length < 3) {
        const note = cwMapNote.get(tone[0]);
        tone.push(note);
      }
      return tone;
    });
    return seq;
  });

  const { attempts } = thisData.result;

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
      sequenceProgress.push({
        index: i,
        notes: seq,
        attempts: attempts - resultLength + staticSeq[0] + i,
      });
    });

    chart.update({ sequenceProgress, jump: true, condition });

    const prePrinted = d3.range(staticSeq[0], staticSeq[1]);

    prePrinted.forEach(seq => {
      chart.moveSequence({
        index: seq - staticSeq[0],
        jump: true,
        duration: 0,
      });
    });
  }

  const playNextSequence = si => {
    sequenceProgress.push({
      index: si,
      notes: [],
      attempts: attempts - resultLength + maxSequences[0] + si,
    });

    const sequence = sequences[si];
    Audio.play({
      chart,
      sequence,
      tempo,
      swapFn,
      condition,
      noteCallback: val => {
        // this runs for every note played

        // add this note to the sequence progress array
        const thisSeq = sequenceProgress.filter(d => d.index === si);
        // find the next note that needs to be played
        const notesPlayed = thisSeq[0].notes.length;
        const note = val[notesPlayed];

        // check the status only if it's currently false
        if (!statusDone) checkSuspendedAudio();

        // find the length of the entire sequence
        const seqLength = val.length;

        // adjust the number of notes now played
        // notesPlayed += 1;

        // only add new notes if they haven't all already been added
        if (notesPlayed < seqLength) thisSeq[0].notes.push(note);

        const noteLength = thisSeq[0].notes.length;

        // send the new note data to be updated
        chart.update({ sequenceProgress, jump: false, condition });

        // check if this was the last note of the sequence
        if (note && noteLength === seqLength) {
          const finalDuration = findDuration(tempo, note[1]);
          chart.moveSequence({
            index: si,
            jump: false,
            duration: finalDuration,
          });
          // move onto the next sequence
          seqIndex = si + 1;

          // if this is the live chart, update the live chart count
          if (condition === 'live') {
            // are we at the end?
            const end = liveChartCount + 1 === maxSequences[1];
            // console.log({ liveChartCount, max: maxSequences[1], end });
            if (end === true) liveChartCount = 0;
            else liveChartCount += 1;
          }

          // make sure that sequenceProgress never has more than 10 items in it
          const progressLength = sequenceProgress.length;
          if (progressLength > DOM_CUTOFF) sequenceProgress.shift();

          // if we haven't hit the last sequence, do this again
          if (si + 1 < sequences.length)
            pauseTimeout = setTimeout(
              () => playNextSequence(si + 1),
              finalDuration + 500
            );
        }
      },
    });
  };

  playNextSequence(seqIndex);
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
    // in case it reached the end
    playChart({
      chart: rend,
      thisData,
      maxSequences: toCut
        ? [0, totalAttempts]
        : [liveChartCount - 10, totalAttempts],
      staticSeq: [Math.max(liveChartCount - 10, 0), liveChartCount],
      condition,
    });
  } else {
    playChart({
      chart: rend,
      thisData,
      maxSequences,
      staticSeq: [0, 0],
      condition,
    });
  }
}

function setupEnterView() {
  // this puts an invisible element below the piano graphic
  // when it hits the top of the screen (graphic out of view)
  // it turns off the graphic (since exit only applies to upward)
  EnterView({
    selector: '.figure__stop',
    enter(el) {
      const condition = d3.select(el).attr('data-type');
      // console.log('enter - stop ....', condition);
      stop(condition);
    },
    offset: 1,
  });

  EnterView({
    selector: '.figure__piano',
    enter(el) {
      const condition = d3.select(el).attr('data-type');
      // console.log('enter - piano ...', condition);
      stop();
      if (condition !== 'all' && condition !== 'two') {
        // no enter view for select chart
        findChartSpecifics(condition);
      }
    },
    exit(el) {
      const condition = d3.select(el).attr('data-type');
      // console.log('exit  - piano ...', condition);
      stop(condition);
    },
    offset: 0.7,
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
    stop(type);
    if (type === 'live') liveChartCount = 0;
    if (type === 'all') {
      handleAllClick('generate');
    } else findChartSpecifics(type);
  });

  $correct.on('click', function(d) {
    charts.all.clear();
    handleAllClick('correct');
  });

  $closest.on('click', () => {
    stop('live');

    // find which songs already have results
    const hasResults = data.levels.filter(d => d.result);

    // keep last one (presumably the one still running)
    const song = hasResults.pop();
    const closest = song.nearestIndex;
    const recentLength = song.result.recent.length;
    const toCut = closest < 10;

    // reset live chart global count
    liveChartCount = closest;

    playChart({
      chart: charts.live,
      thisData: song,
      maxSequences: toCut ? [0, recentLength] : [closest - 10, recentLength],
      staticSeq: [Math.max(closest - 10, 0), closest],
      condition: 'live',
    });
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
    stop();
    const sel = d3.select(this).property('value');

    const song = data.levels.find(d => d.title === sel);

    generatedData = {
      title: song.title,
      tempo: song.tempo,
      sig: song.sig,
      swap: song.swap,
      result: { recent: [] },
    };

    charts.all.clear();

    charts.all
      .data(song)
      .resize()
      .render();

    jump(this, { offset: -64, duration: 500 });
  });
}

function setupNoteMap() {
  const cwData = crosswalk.map(d => [d.midi, d.note]);
  cwMapNote = new Map(cwData);
}

function checkSuspendedAudio() {
  if (!statusDone) {
    const status = Audio.checkStatus();
    if (status !== 'suspended') {
      $buttons.html((d, i) => {
        const pre = i === $buttons.size() - 1 ? 'Generate' : 'Replay';
        return `${pre} ${replaySvg}`;
      });
      statusDone = true;
    }
  }
}

function updateDuration(seq, swap) {
  const updatedSeq = seq.map(d => {
    const { midi } = d;
    let dur = null;
    if (!swap) dur = d.duration;
    else {
      const [f, r] = swap.split('-').map(v => +v);
      dur = d.duration === f ? r : d.duration;
    }
    return { midi, duration: dur };
  });
  return updatedSeq;
}

function cleanData(lev) {
  const l = lev.levels.map(level => {
    const cleaned = {
      ...level,
      sequence: updateDuration(level.sequence, level.swap),
    };
    return cleaned;
  });

  return {
    ...lev,
    levels: l,
  };
}

function init({ levels, cw }) {
  data = cleanData(levels);
  crosswalk = cw;
  setupNoteMap();
  Audio.init(() => {
    // scroll triggers
    $pianos.each(setupCharts);
    setupEnterView();
    setupRestartButtons();
    setupDropdown(data);
    checkSuspendedAudio();
  });
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize };
