import EnterView from 'enter-view';
import loadData from './load-data';
import findUnique from './utils/unique';
import audio from './audio';
import './pudding-chart/notes';
import dirtyCrosswalk from './pianoData.json';

const $article = d3.select('article');
const $pianos = $article.selectAll('.figure__piano');
const charts = {};

let data = [];
let crosswalk = [];
let cwMap = [];

// function setupChartEnter() {
//   EnterView({
//     selector: '.figure__piano',
//     enter(el, i) {
//       // pause other charts
//       Object.keys(charts).map(d => {
//         const val = charts[d];
//         val.pause();
//       });

//       // select the currently entered chart and update/play it
//       const condition = d3.select(el).attr('data-type');
//       const rend = charts[condition];
//       rend.update();
//     },
//     offset: 0.25,
//     once: true,
//   });
// }

function filterData(condition) {
  let specificData = null;
  // separate out phases for the first few steps which repeat the same piano
  const setupPianos = ['two', 'animated', 'results', 'success'];
  if (setupPianos.includes(condition)) {
    const filteredData = data.levels.filter(
      d => d.title === 'Symphony No. 5 I'
    )[0];
    if (condition === 'animated') {
      specificData = [filteredData].map(d => {
        return {
          ...d,
          result: [d.result].map(e => {
            return {
              ...e,
              recent: [e.recent[0]],
            };
          })[0],
        };
      })[0];
    } else specificData = filteredData;
  } else if (condition === 'Meryl')
    specificData = data.levels.filter(d => d.title === 'Symphony No. 5  II')[0];
  else specificData = data.levels.filter(d => d.title === 'Ice Ice Baby')[0];

  return specificData;
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

function findKeys(range) {
  const midisSorted = range.sort(d3.ascending);
  const endMidis = d3.extent(midisSorted);
  const allMidis = d3.range(endMidis[0], endMidis[1]);

  // find all octaves represented
  const octaves = allMidis.map(d => cwMap.get(d)).filter(d => d);
  const uniqueOctaves = findUnique(octaves);

  // ensure full range encapsulated
  const allOctaves = d3.range(
    Math.min(...uniqueOctaves),
    Math.max(...uniqueOctaves) + 1
  );

  const keys = crosswalk.filter(d => allOctaves.includes(d.octave));

  return keys;
}

function cleanCrosswalk(cw) {
  const cleaned = cw.map(d => ({
    ...d,
    midi: +d.midi,
    sharp: d.note.includes('#'),
    octave: +d.octave,
  }));

  const cwData = cleaned.map(d => [d.midi, d.octave]);
  cwMap = new Map(cwData);

  return cleaned;
}

function cleanData(dat) {
  const cleanedLevels = dat.levels.map(d => ({
    ...d,
    keys: findKeys(d.range.midis),
  }));

  const cleaned = [dat].map(d => ({
    ...d,
    levels: cleanedLevels,
  }))[0];

  return cleaned;
}

function init() {
  const v = Date.now();
  const dataURL = `https://pudding.cool/2020/04/infinite-data/data.json?version=${v}`;

  loadData(dataURL)
    .then(result => {
      crosswalk = cleanCrosswalk(dirtyCrosswalk);
      return result;
    })
    .then(result => {
      data = cleanData(result);
      $pianos.each(setupCharts);
    })
    .catch(console.log);
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize, importCharts };
