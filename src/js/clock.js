/* global d3 */
const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;
const $table = d3.select('.clock__container table');
const $days = $table.select('.days');
const $hours = $table.select('.hours');
const $minutes = $table.select('.minutes');
const $seconds = $table.select('.seconds');
let dateStart = null;

function format(num) {
  return d3.format('02')(num);
}

function update() {
  const diff = Date.now() - dateStart;
  const days = Math.floor(diff / DAY);
  const leftD = diff % DAY;
  const hours = Math.floor(leftD / HOUR);
  const leftH = diff % HOUR;
  const minutes = Math.floor(leftH / MINUTE);
  const leftM = diff % MINUTE;
  const seconds = Math.floor(leftM / SECOND);
  $days.text(format(days));
  $hours.text(format(hours));
  $minutes.text(format(minutes));
  $seconds.text(format(seconds));
}

function init({ start }) {
  dateStart = new Date(start);
  d3.interval(update, 1001);
}

export default { init };
