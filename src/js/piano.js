import loadData from './load-data';
import './pudding-chart/notes';

const $section = d3.select('#story');
const $pianos = $section.selectAll('.piano__container');
const charts = [];

let data = [];
let crosswalk = [];
console.log({ crosswalk });

function setupCharts() {
    const $sel = d3.select(this);
    const condition = $sel.attr('data-type');
    let specificData = [];

    console.log({ data });
    // separate out phases for the first few steps which repeat the same piano
    const setupPianos = ['two', 'animated', 'results', 'success'];
    if (setupPianos.includes(condition))
        specificData = data.levels.filter(d => d.title === "Beethoven's 5th I")[0];
    else specificData = data.levels.filter(d => d.title === 'Symphony No. 5')[0];

    const chart = $sel.data([specificData]).noteChart();
    console.log({ chart, lev: data.levels });
    chart.resize().render();
    charts.push(chart);
}

function cleanCrosswalk(cw) {
    const cleaned = cw.map(d => ({
        ...d,
        midi: +d.midi,
        sharp: d.note.includes('#'),
        octave: +d.octave,
    }));

    return cleaned;
}

function init() {
    const v = Date.now();
    const dataURL = `https://pudding.cool/2020/04/infinite-data/data.json?version=${v}`;

    loadData([dataURL, './crosswalk.csv'])
        .then(result => {
            console.log({ result });
            data = result[0];
            crosswalk = cleanCrosswalk(result[1]);
            console.log({ crosswalk });
            $pianos.each(setupCharts);
        })
        .catch(console.log);
}

function resize() { }

export default { init, resize };
