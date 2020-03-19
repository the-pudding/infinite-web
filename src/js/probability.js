/* global d3 */
const choices = {
  note: 2,
  duration: 4,
};
const len = 4;

function resize() {}

function setupChart() {
  const $chart = d3.select(this);
  const t = $chart.attr('data-type');
  const c = choices[t];
  const data = d3.range(len).map(d => Math.pow(c, d + 1));
  const $div = $chart
    .selectAll('div')
    .data(data)
    .join('div');
  $div
    .append('p')
    .html(
      (d, i) =>
        `<strong>${i + 1}${
          i === 0 ? ' note' : ''
        }</strong><span>1 in ${d}</span>`
    );
  $div
    .append('ul')
    .selectAll('li')
    .data(d => d3.range(d))
    .join('li');
}

function init() {
  d3.selectAll('.probability__container').each(setupChart);
}

export default { init, resize };
