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

function playChart() {
  // handle start sequence, and moving on to new sequences
  // let notesPlayed = 0;
  // Audio.play({ sequence, tempo, sig, noteCallback: () => {
  // notesPlayed += 1;
  // conditional;
  // } });
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
      rend.update();
      playChart();
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
