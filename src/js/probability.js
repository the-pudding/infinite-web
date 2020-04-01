/* global d3 */
const choices = {
  note: 2,
  duration: 4,
};
const len = 4;

function setupChart() {
  const $chart = d3.select(this);
  const t = $chart.attr('data-type');
  const c = choices[t];
  const data = d3.range(len).map(d => Math.pow(c, d + 1));
  const $div = $chart
    .select('.figure__inner')
    .selectAll('div')
    .data(data)
    .join('div');
  $div
    .append('p')
    .html(
      (d, i) =>
        `<strong>${i + 1}${
          i === 0 ? ' note' : ' notes'
        }</strong><span><mark>1 in ${d}</mark></span>`
    );
  $div
    .append('ul')
    .selectAll('li')
    .data(d => d3.range(d))
    .join('li');
}

function init() {
  d3.selectAll('.figure__probability').each(setupChart);
}

export default { init };
