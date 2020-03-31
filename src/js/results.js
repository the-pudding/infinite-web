/* global d3 */
const $table = d3.select('.figure__results table');
const $btn = d3.select('.figure__results button');
const $inner = d3.select('.figure__results .inner');
function toggleTable() {
  const visible = $inner.classed('is-visible');
  $inner.classed('is-visible', !visible);
  $btn.text(visible ? 'Show All' : 'Hide All');
}

function format(num) {
  let out = '';

  const r = `${num}`.split('');

  r.reverse();

  r.forEach((d, i) => {
    const c = i % 3 === 0 ? ',' : '';
    out = `${out}${c}${d}`;
  });

  const s = out.split('');
  if (s[0] === ',') s.shift();
  s.reverse();

  return s.join('');
}

function getDate(str) {
  return `${str.substring(8, 11)}. ${str.substring(5, 7)}, ${str.substring(
    11,
    16
  )}`;
}

function init({ levels }) {
  const $tr = $table
    .select('tbody')
    .selectAll('tr')
    .data(levels)
    .join('tr');
  $tr.classed('is-success', d => d.result && d.result.done);
  $tr.classed('is-progress', d => d.result && !d.result.done);
  $tr
    .append('td')
    .attr('data-title', 'Song')
    .html(d => `${d.title} <span><em>${d.artist}</em></span>`);
  $tr
    .append('td')
    .attr('data-title', 'Artist')
    .text(d => d.artist);
  $tr
    .append('td')
    .attr('data-title', 'Odds')
    .text((d, i) => `${i === 0 ? '1 in ' : ''}${format(d.odds)}`);
  $tr
    .append('td')
    .attr('data-title', 'Attempts')
    .text(d => (d.result ? format(d.result.attempts) : 'NA'));
  $tr
    .append('td')
    .attr('data-title', 'Est. Completion')
    .text(d => {
      if (d.result && d.result.done) return `Finished ${getDate(d.result.end)}`;
      return `In ${d.estimate}`;
    });

  $btn.on('click', toggleTable);
}

export default { init };
