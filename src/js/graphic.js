/* global d3 */
import jump from 'jump.js';

const $intro = d3.select('#intro');
const $header = d3.select('header');

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

function init() {
  $intro.selectAll('button').on('click', handleIntro);
  d3.select('.audio').on('click', handleHeader);
}

export default { init, resize };
