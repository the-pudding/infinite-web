/* global d3 */
import jump from 'jump.js';
import dirtyCrosswalk from './pianoData.json';
import findUnique from './utils/unique';
import Piano from './piano';
import Audio from './audio';
import volume2Svg from './volume2';

const $intro = d3.select('#intro');
const $header = d3.select('header');

let cwMap = null;
let data = [];

function resize() {
  // Piano.resize();
}

function toggleAudio(dir) {
  const isOn = $header.select('.audio .on').classed('is-visible');
  const goOn = dir ? dir === 'on' : !isOn;
  const over = goOn ? 'on. Good choice.' : 'off.';
  $intro.select('.intro__overline span').text(over);
  $header.select('.on').classed('is-visible', goOn);
  $header.select('.off').classed('is-visible', !goOn);
  Audio.mute(!goOn);
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
  const rest = midisSorted.includes(0);
  const noZero = midisSorted.filter(d => d !== 0);
  const endMidis = d3.extent(noZero);
  const allMidis = d3.range(endMidis[0], endMidis[1] + 1);

  // find all octaves represented
  const octaves = allMidis.map(d => cwMap.get(d)); // .filter(d => d);
  const uniqueOctaves = findUnique(octaves);

  // ensure full range encapsulated
  const allOctaves = d3.range(
    Math.min(...uniqueOctaves),
    Math.max(...uniqueOctaves) + 1
  );

  const keys = crosswalk.filter(d => allOctaves.includes(d.octave));
  if (rest === true) keys.push({ midi: 0, note: 'rest', sharp: false });

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

function inlineAudio() {
  const $audio = d3.select('.hidden-audio');
  const $el = d3.select('.inline-audio');
  const t = $el.text();
  $el.html(`${t} ${volume2Svg}`);
  $el.on('click', () => {
    $audio.node().play();
  });
}

function insertText(raw) {
  const current = raw.levels.find(d => !d.result.done);
  const d = new Date(raw.start);
  const s = d.toDateString();
  const start = `${s.substring(4, 7)}. ${s.substring(8, 10)}, ${s.substring(
    11,
    15
  )}`;
  d3.select('.beethoven-attempts').text(raw.levels[0].result.attempts);
  d3.select('.beethoven2-attempts').text(raw.levels[1].result.attempts);
  d3.select('.experiment-start').text(start);
  d3.select('.current-song').html(
    `<strong>${current.title} by ${current.artist}</strong>`
  );
  d3.select('.current-estimate').html(current.estimate);
}

function init(raw) {
  $intro.selectAll('button').on('click', handleIntro);
  d3.select('.audio').on('click', handleHeader);
  insertText(raw);
  inlineAudio();

  const crosswalk = cleanCrosswalk(dirtyCrosswalk);
  data = cleanData({ raw, crosswalk });
  Piano.init({ levels: data, cw: crosswalk });
}

export default { init, resize };
