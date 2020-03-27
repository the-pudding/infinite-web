/* global d3 */
export default function generate({ range, sequence }) {
  const seqLen = sequence.length;
  const { midis, durations } = range;
  midis.sort(d3.ascending);
  durations.sort(d3.ascending);
  const mL = midis.length;
  const dL = durations.length;

  const seq = [];
  let s = 0;
  while (s < seqLen) {
    seq.push([
      midis[Math.floor(Math.random() * mL)],
      durations[Math.floor(Math.random() * dL)],
    ]);
    s += 1;
  }

  return seq;
}
