import loadData from './load-data';
import findUnique from './utils/unique';
import './pudding-chart/notes';

const $section = d3.select('#story');
const $pianos = $section.selectAll('.piano__container');
const charts = [];

let data = [];
let crosswalk = [];
let cwMap = [];

function setupCharts() {
  const $sel = d3.select(this);
  const condition = $sel.attr('data-type');
  let specificData = [];

  // separate out phases for the first few steps which repeat the same piano
  const setupPianos = ['two', 'animated', 'results', 'success'];
  if (setupPianos.includes(condition)) {
    const filteredData = data.levels.filter(
      d => d.title === 'Symphony No. 5 I'
    )[0];
    if (condition === 'animated') {
      // console.log({ filteredData });
      specificData = [filteredData].map(d => {
        return {
          ...d,
          result: [d.result].map(e => {
            // console.log({ e });
            return {
              ...e,
              recent: [e.recent[0]],
            };
          })[0],
        };
      })[0];
    } else specificData = filteredData;
    // console.log({ specificData });
  } else if (condition === 'Meryl')
    specificData = data.levels.filter(d => d.title === 'Symphony No. 5  II')[0];
  else specificData = data.levels.filter(d => d.title === 'Ice Ice Baby')[0];

  const chart = $sel.data([specificData]).noteChart();
  chart.resize().render();
  charts.push(chart);
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

  loadData([dataURL, './crosswalk.csv'])
    .then(result => {
      crosswalk = cleanCrosswalk(result[1]);
      return result[0];
    })
    .then(result => {
      data = cleanData(result);
      // console.log({ data });
      $pianos.each(setupCharts);
    })
    .catch(console.log);
}

function resize() {
  charts.forEach(chart => chart.resize().render());
}

export default { init, resize };
