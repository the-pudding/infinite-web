/* global d3 */
import jump from 'jump.js';
import dirtyCrosswalk from './pianoData.json';
import findUnique from './utils/unique';
import piano from './piano';

const $intro = d3.select('#intro');
const $header = d3.select('header');

let cwMap = null;
let data = [];

function resize() {}

function toggleAudio(dir) {
  const isOn = $header.select('.audio .on').classed('is-visible');
  const goOn = dir ? dir === 'on' : !isOn;
  const over = goOn ? 'on. Good choice.' : 'off.';
  $intro.select('.intro__overline span').text(over);
  $header.select('.on').classed('is-visible', goOn);
  $header.select('.off').classed('is-visible', !goOn);
}
function handleHeader() {
  toggleAudio();
}

function handleIntro() {
  const audio = d3.select(this).attr('data-audio');
  toggleAudio(audio);
  jump('article', { duration: 500 });
}

function findKeys({ range, crosswalk }) {
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

function cleanData({ raw, crosswalk }) {
  const cleanedLevels = raw.levels.map(d => ({
    ...d,
    keys: findKeys({ range: d.range.midis, crosswalk }),
  }));

  const cleaned = [raw].map(d => ({
    ...d,
    levels: cleanedLevels,
  }))[0];

  return cleaned;
}

function init(raw) {
  $intro.selectAll('button').on('click', handleIntro);
  d3.select('.audio').on('click', handleHeader);

  const crosswalk = cleanCrosswalk(dirtyCrosswalk);
  data = cleanData({ raw, crosswalk });
  piano.init({ levels: data, cw: crosswalk });
}

export default { init, resize };
