import LevDist from 'levdist';
// [[67, 3], ...]
function getNearestIndex({ recent, sequence }) {
  if (recent) {
    const formatted = sequence.map(d => [d.midi, d.duration]);
    const answer = formatted.map(d => `${d[0]}-${d[1]}.`).join('');
    const best = { dist: 999, index: -1 };
    recent.forEach((r, i) => {
      const attempt = r.map(d => `${d[0]}-${d[1]}.`).join('');
      const dist = LevDist(answer, attempt);
      if (dist < best.dist) {
        best.index = i;
        best.dist = dist;
      }
    });
    return best.index;
  }
  return null;
}
export default getNearestIndex;
