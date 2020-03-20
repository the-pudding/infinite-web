/* global d3 */
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import linkFix from './utils/link-fix';
import graphic from './graphic';
import piano from './piano';
import probability from './probability';
import clock from './clock';
import footer from './footer';
import loadData from './load-data';

const $body = d3.select('body');
let previousWidth = 0;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    graphic.resize();
    // piano.resize();
  }
}

function setupStickyHeader() {
  const $header = $body.select('header');
  if ($header.classed('is-sticky')) {
    const $menu = $body.select('.header__menu');
    const $toggle = $body.select('.header__toggle');
    $toggle.on('click', () => {
      const visible = $menu.classed('is-visible');
      $menu.classed('is-visible', !visible);
      $toggle.classed('is-visible', !visible);
    });
  }
}

function begin(data) {
  graphic.init();
  // piano.init();
  probability.init();
  clock.init(data);
  // load footer stories
  footer.init();
}
function init() {
  // adds rel="noopener" to all target="_blank" links
  linkFix();
  // add mobile class to body tag
  $body.classed('is-mobile', isMobile.any());
  // setup resize event
  window.addEventListener('resize', debounce(resize, 150));
  // setup sticky header menu
  setupStickyHeader();
  // kick off graphic code

  const v = Date.now();
  const dataURL = `https://pudding.cool/2020/04/infinite-data/data.json?version=${v}`;
  loadData(dataURL)
    .then(begin)
    .catch(console.log);
}

init();
