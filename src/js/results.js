/* global d3 */
const $table = d3.select('.figure__results table');

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
  $tr.classed('is-success', d => d.result);
  $tr.append('td').html(d => `${d.title} <span><em>${d.artist}</em></span>`);
  $tr.append('td').text((d, i) => `${i === 0 ? '1 in ' : ''}${format(d.odds)}`);
  $tr.append('td').text(d => (d.result ? format(d.result.attempts) : 'NA'));
  $tr
    .append('td')
    .text((d, i) =>
      d.result && d.result.done
        ? `Finished ${getDate(d.result.end)}`
        : `In ${d.estimate}`
    );
}

export default { init };
