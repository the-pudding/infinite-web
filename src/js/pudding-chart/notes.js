/* global d3 */

/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.noteChart = function init(options) {
  function createChart(el) {
    // dom elements
    const $chart = d3.select(el);
    let $svg = null;
    let $gSeq = null;
    const $axis = null;
    let $vis = null;
    const thisChart = $chart.attr('data-type');

    // data
    let data = $chart.datum();
    let keyMap = [];

    // dimensions
    let width = 0;
    let height = 0;
    const MARGIN_TOP = 16;
    const MARGIN_BOTTOM = 0;
    const MARGIN_LEFT = 16;
    const MARGIN_RIGHT = 16;
    // height of white keys
    let whiteHeight = 0;
    // width of white keys
    let whiteWidth = 0;
    const PADDING = 10;

    // scales
    const scaleXGuide = d3.scaleBand();
    const scaleGuideBlock = d3.scaleLinear();

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
    }

    function generatePiano() {
      const { keys } = data;
      const numKeys = keys.length;

      const WIDTH_TO_HEIGHT_RATIO = 0.2;
      const idealWidth = width * 0.25 * WIDTH_TO_HEIGHT_RATIO;
      const HEIGHT_CUTOFF = height * 0.5;
      // does the ideal width make the piano too tall?
      const tooTall = idealWidth * numKeys > HEIGHT_CUTOFF;
      const PIANO_HEIGHT = tooTall
        ? // if so, figure out the widest each key can be
          HEIGHT_CUTOFF / numKeys / WIDTH_TO_HEIGHT_RATIO
        : //   otherwise  , scale the piano's height based on taking up 1/4 of the svg width
          width * 0.25;
      // const PIANO_WIDTH = PIANO_HEIGHT *   WIDTH_TO_HEIGHT_RATIO;
      const WIDTH_RATIO = 0.7;
      const HEIGHT_RATIO = 0.6;
      whiteWidth = PIANO_HEIGHT * WIDTH_TO_HEIGHT_RATIO; // Math.round(PIANO_WIDTH / whiteKeys);
      const blackWidth = Math.round(whiteWidth * WIDTH_RATIO);

      whiteHeight = PIANO_HEIGHT;
      const blackHeight = PIANO_HEIGHT * HEIGHT_RATIO;

      // how many white keys came before this key?
      const numLowerWhites = midi =>
        keys.filter(e => e.midi < midi && e.sharp === false).length;

      // return an updated array with key coordinates
      return keys.map(d => {
        // if the keys are sharp/black offset them
        const offset = d.sharp === false ? 0 : blackWidth;

        return {
          ...d,
          coord: {
            y: {
              min: HEIGHT_CUTOFF - whiteWidth * numLowerWhites(d.midi) + offset,
              max:
                HEIGHT_CUTOFF -
                whiteWidth * numLowerWhites(d.midi) +
                offset +
                (d.sharp === false ? whiteWidth : blackWidth),
            },
            x: {
              min: width - whiteHeight,
              // min: d.sharp === false ? 0 : (1 - HEIGHT_RATIO) * width,
              max:
                d.sharp === false ? width : width - (whiteHeight - blackHeight),
            },
          },
        };
      });
    }

    function setupGuide(pianoData, sequence) {
      const possibleMidis = pianoData.map(e => e.midi);
      const filtSeq = sequence.filter(d => possibleMidis.includes(d.midi));

      const updatedSeq = filtSeq.map(d => {
        const { coord } = pianoData.filter(e => e.midi === d.midi)[0];
        return { ...d, coord };
      });

      return updatedSeq;
    }

    function isCorrect(note, index) {
      return (
        note[0] === data.sequence[index].midi &&
        note[1] === data.sequence[index].duration
      );
    }

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.append('svg').attr('class', 'graphic__piano');

        // setup viz group
        $vis = $svg.append('g').attr('class', 'g-vis');

        // setup group for guide
        $vis.append('g').attr('class', 'g-guide');

        // setup group for notes
        $gSeq = $vis.append('g').attr('class', 'g-notes');

        // setup group for piano
        $vis.append('g').attr('class', 'g-piano');
      },
      // on resize, update new dimensions
      resize() {
        // defaults to grabbing dimensions from container element
        width = $chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT;
        height = $chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM;
        $svg
          .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
          .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM);
        return Chart;
      },
      // update scales and render chart
      render() {
        // offset chart for margins
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);

        // generate data for keys and guides
        const pianoData = generatePiano();
        const guideData = setupGuide(pianoData, data.sequence);

        // find which keys are used in current sequence
        const activeKeys = findUnique(data.sequence.map(d => d.midi));

        // create a key map
        const keyCoord = guideData.map(d => [d.midi, d.coord]);
        keyMap = new Map(keyCoord);

        // append the piano
        $vis
          .select('.g-piano')
          .selectAll('.key')
          .data(pianoData, d => d.midi)
          .join(enter =>
            enter
              .append('rect')
              .attr('class', d => {
                if (d.note === 'rest') return `key key__rest`;
                if (d.sharp === true) return `key key__black`;
                return `key key__white`;
              })
              .attr('data-midi', d => d.midi)
              .classed('active', d => activeKeys.includes(d.midi))
          )
          .attr('x', d => d.coord.x.min)
          .attr('y', d => d.coord.y.min)
          .attr('width', d => d.coord.x.max - d.coord.x.min)
          .attr('height', d => d.coord.y.max - d.coord.y.min);

        const restCoord = pianoData.filter(d => d.midi === 0)[0].coord; // .coord;

        // add text to rest key
        $vis
          .select('.g-piano')
          .append('text')
          .text('rest')
          .attr(
            'transform',
            `translate(${restCoord.x.min}, ${restCoord.y.min + 5})`
          )
          .attr('alignment-baseline', 'hanging');

        // raise black keys on top of white ones in DOM
        $vis.selectAll('.key__black').raise();

        // setup scales for sequence guides
        const durations = guideData.map(d => d.duration);
        const uniqueDurations = findUnique(durations);
        scaleXGuide
          .range([0, width * 0.75])
          .domain(d3.range(0, guideData.length));
        scaleGuideBlock
          .range([whiteWidth, whiteWidth * 2])
          .domain([
            2 ** Math.max(...uniqueDurations),
            2 ** Math.min(...uniqueDurations),
          ]);

        // append the sequence guides
        if (thisChart !== 'two') {
          $vis
            .select('.g-guide')
            .selectAll('.guide')
            .data(guideData)
            .join(enter => enter.append('rect').attr('class', 'guide'))
            .attr('x', (d, i) => scaleXGuide(i))
            .attr('y', d => d.coord.y.min)
            .attr('width', d => scaleGuideBlock(2 ** d.duration))
            .attr('height', d => whiteWidth);
        }

        return Chart;
      },
      pressKey({ key }) {
        key
          .transition()
          .duration(100)
          .style('fill', d => 'red')
          .transition()
          .duration(100)
          .style('fill', d => (d.sharp === true ? '#000' : '#fff'));

        const keyData = key.data();
        const { coord, midi } = keyData[0];

        const $note = $gSeq.append('rect').attr('class', 'note');

        $note
          .attr('x', coord.x.min)
          .attr('y', coord.y.min)
          .attr('width', scaleGuideBlock(2 ** 3))
          .attr('height', whiteWidth)
          .transition()
          .duration(1000)
          .attr('x', -width);
      },
      clear() {
        $gSeq.selectAll('.sequence').exit();
      },
      update({ sequenceProgress, jump }) {
        const ANIMATION_DURATION = jump ? 0 : 50;
        const $group = $vis.select('.g-notes');

        const $seq = $group
          .selectAll('.sequence')
          .data(sequenceProgress)
          .join(enter =>
            enter
              .append('g')
              .attr('class', 'sequence')
              .attr('data-order', (d, i) => i)
          );

        $seq
          .selectAll('.note')
          .data(d => d)
          .join(enter => {
            const $playedNote = enter
              .append('rect')
              .attr('class', 'note')
              .attr('x', width * 0.9)
              .attr('y', d => {
                const coord = keyMap.get(+d[0]);
                return coord.y.min;
              })
              .attr('width', d => scaleGuideBlock(2 ** d[1]))
              .attr('height', whiteWidth)
              .classed('is-correct', (d, i) => isCorrect(d, i));

            $playedNote
              .transition()
              .duration(ANIMATION_DURATION)
              .attr('x', (d, i) => scaleXGuide(i));
          });
      },
      moveSequence({ index, jump }) {
        const seqIndex = index;
        const ANIMATION_DURATION = jump ? 0 : 200;
        const ANIMATION_DELAY = jump ? 0 : 100;

        // set the just finished sequence class to finished
        const $justFinished = $vis
          .selectAll('.sequence')
          .filter((d, i, n) => {
            const order = d3.select(n[i]).attr('data-order');
            return order === `${seqIndex}`;
          })
          .classed('finished', true);

        $justFinished
          .selectAll('.note')
          .transition()
          .delay(ANIMATION_DELAY)
          .duration(ANIMATION_DURATION)
          .attr('y', height * 0.5);

        const $allFinished = $vis.selectAll('.finished').nodes();
        $allFinished.forEach((g, index) => {
          const played = d3.select(g);
          // const staticPlayed = played.attr('data-static');
          const slot = $allFinished.length - index;

          played
            .transition()
            .duration(ANIMATION_DURATION)
            .attr(
              'transform',
              `translate(0, ${(whiteWidth + PADDING) * slot})`
            );
        });
      },
      // pause animations?
      pause() {
        console.log('paused');
      },
      // get / set data
      data(val) {
        if (!arguments.length) return data;
        data = val;
        $chart.datum(data);
        return Chart;
      },
    };
    Chart.init();

    return Chart;
  }

  // create charts
  const charts = this.nodes().map(createChart);
  return charts.length > 1 ? charts : charts.pop();
};
