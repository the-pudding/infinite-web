/* global d3 */
import jump from 'jump.js';

const $intro = d3.select('#intro');

function resize() {}

function handleIntroButton() {
  const audio = d3.select(this).attr('data-audio');
  const over = audio === 'on' ? 'on. Good choice.' : 'off.';
  $intro.select('.intro__overline span').text(over);
  jump('article', { duration: 500 });
}

function init() {
  $intro.selectAll('button').on('click', handleIntroButton);
}

export default { init, resize };
