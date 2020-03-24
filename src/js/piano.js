import EnterView from 'enter-view';
import Audio from './audio';
import './pudding-chart/notes';

const $article = d3.select('article');
const $pianos = $article.selectAll('.figure__piano');
const charts = {};

let data = [];

function filterData(condition) {
  let specificData = null;
  // separate out phases for the first few steps which repeat the same piano
  const setupPianos = ['two', 'animated', 'results', 'success'];
  if (setupPianos.includes(condition)) {
    [specificData] = data.levels.filter(d => d.title === 'Symphony No. 5 I');
  } else if (condition === 'Meryl')
    [specificData] = data.levels.filter(d => d.title === 'Symphony No. 5  II');
  else [specificData] = data.levels.filter(d => d.title === 'Ice Ice Baby');

  return specificData;
}

function handleNewNote({ note, duration }) {
  // tell chart to update with new note and duration
}

function playChart({ chart, thisData, maxSequences, staticSeq }) {
  const sequences = thisData.result.recent.slice(0, maxSequences);
  const staticData = thisData.result.recent.slice(staticSeq[0], staticSeq[1]);
  const { tempo, sig } = thisData;
  // [[[63, 3], [67, 3], [63, 3]],
  //  [[63, 3], [67, 3], [63, 3]]]
  // chart.setupSequences(sequences);
  const sequenceProgress = [];

  // chart.update(sequenceProgress, jump: true);
  let seqIndex = 0;

  if (staticData.length) {
    seqIndex = staticData.length;
    staticData.forEach(seq => {
      sequenceProgress.push(seq);
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
    sequenceProgress.push([]);
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
        sequenceProgress[seqIndex].push(note);

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

          // if we haven't hit the last sequence, do this again
          if (seqIndex < sequences.length)
            setTimeout(() => playNextSequence(), 500);
        }
        // notesPlayed += 1;
        // if (done with sequence) {
        // seqIndex +=1;
        // if (seqIndex < sequences.length)
        //   // playNextSequence();
        // }
        // }
      },
    });
  };

  playNextSequence();
}

function setupEnterView() {
  EnterView({
    selector: '.figure__piano',
    enter(el, i) {
      // pause other charts
      Object.keys(charts).map(d => {
        const val = charts[d];
        // val.pause();
      });

      // select the currently entered chart and update/play it
      const condition = d3.select(el).attr('data-type');
      const rend = charts[condition];
      const thisData = rend.data();
      const maxSequences =
        condition === 'animated' ? 1 : thisData.result.attempts;

      if (condition !== 'two') {
        if (condition === 'results')
          playChart({
            chart: rend,
            thisData,
            maxSequences: 4,
            staticSeq: [0, 1],
          });
        else if (condition === 'success')
          playChart({ chart: rend, thisData, maxSequences, staticSeq: [0, 4] });
        else
          playChart({ chart: rend, thisData, maxSequences, staticSeq: [0, 0] });
      }
    },
    offset: 0.25,
    once: true,
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

function importCharts() {
  return new Promise((resolve, reject) => {
    resolve({ charts });
  });
}

function init(levels) {
  data = levels;
  // scroll triggers
  $pianos.each(setupCharts);
  setupEnterView();
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize, importCharts };
