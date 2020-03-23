import pianoData from './pianoData.json';

// desired output
// [{ time: "0:0:0", note: "C4", duration: "4n" }]
export default function midiToNotation(arr) {
  const a = arr.map(({ midi, duration }) => {
    const match = pianoData.find(p => +p.midi === midi);
    const note = match ? `${match.note}${match.octave}` : null;
    duration = `${Math.floor(2 ** duration)}n`;
    return { note, duration };
  });

  let tally = 0;

  const b = a.map(({ note, duration }) => {
    const bars = Math.floor(tally / 16);
    const rem = tally % 16;
    const quarters = Math.floor(rem / 4);
    const sixteenths = rem % 4;
    const time = `${bars}:${quarters}:${sixteenths}`;
    const o = { note, duration, time };

    const d = +duration.replace('n', '');
    tally += Math.floor(16 / d);
    return o;
  });

  const notesNoRests = b.filter(d => d.note);
  return notesNoRests;
}
