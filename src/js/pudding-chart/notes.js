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
    const FONT_SIZE = 18;

    // data
    let data = $chart.datum();
    let keyMap = [];

    // dimensions
    let width = 0;
    let height = 0;
    let pageHeight = 0;
    const MARGIN_TOP = 16;
    const MARGIN_BOTTOM = 24;
    const MARGIN_LEFT = 16;
    const MARGIN_RIGHT = 16;
    // height of white keys
    let whiteHeight = 0;
    // width of white keys
    let whiteWidth = 0;
    const PADDING = 10;
    let keyboardHeight = 0;
    let KEYBOARD_BOTTOM = 0;

    // scales
    const scaleXGuide = d3.scaleBand();
    const scaleGuideBlock = d3.scaleLinear();

    const KEY_COLOR = '#fde24f';

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
    }

    function adjustFigureDimensions() {
      keyboardHeight = Math.floor(
        $vis
          .select('.g-piano')
          .node()
          .getBoundingClientRect().height
      );

      const buttonHeight = $chart.select('button').node().offsetHeight;

      // padding between keyboard and results
      KEYBOARD_BOTTOM = whiteWidth;

      // determine how many results to show
      let results = 0;
      switch (thisChart) {
        case 'two':
          results = 0;
          break;
        case 'animated':
          results = 1;
          break;
        case 'results':
          results = 4;
          break;
        case 'success':
          results = 5;
          break;
        case 'Meryl':
          results = 5;
          break;
        default:
          results = 5;
      }

      const resultHeight = (whiteWidth + PADDING) * results;
      const newHeight =
        keyboardHeight +
        resultHeight +
        KEYBOARD_BOTTOM +
        buttonHeight +
        MARGIN_TOP +
        MARGIN_BOTTOM;
      $chart.style('height', `${newHeight}px`);
      $svg.style('height', `${newHeight - MARGIN_TOP - MARGIN_BOTTOM}px`);
      height = newHeight - MARGIN_TOP - MARGIN_BOTTOM;
    }

    function generatePiano() {
      const { keys } = data;
      // count only white keys since black ones go on top
      const numKeys = keys.filter(d => d.sharp === false).length;

      // the piano should never exceed half the height of the page
      const HEIGHT_CUTOFF = pageHeight * 0.5;

      const WIDTH_TO_HEIGHT_RATIO = 0.2;
      const idealWidth = width * 0.25 * WIDTH_TO_HEIGHT_RATIO;

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

      // how many white keys come after this key?
      const numUpperWhites = midi =>
        keys.filter(e => e.midi > midi && e.sharp === false).length;

      // return an updated array with key coordinates
      return keys.map(d => {
        // if the keys are sharp/black offset them
        const offset = d.sharp === false ? 0 : -blackWidth / 2;

        return {
          ...d,
          coord: {
            y: {
              min: whiteWidth * numUpperWhites(d.midi) + offset,
              max:
                whiteWidth * numUpperWhites(d.midi) +
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

        // setup group for notes
        $gSeq = $vis.append('g').attr('class', 'g-notes');

        // setup group for guide
        $vis.append('g').attr('class', 'g-guide');

        // setup group for piano
        $vis.append('g').attr('class', 'g-piano');
      },
      // on resize, update new dimensions
      resize() {
        // defaults to grabbing dimensions from container element
        pageHeight = window.innerHeight;
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
        // first append a group for each key
        const $keyGroup = $vis
          .select('.g-piano')
          .selectAll('.g-key')
          .data(pianoData, d => {
            const { midi } = d;
            return `${data.title}-${midi}`;
          })
          .join(enter =>
            enter.append('g').attr('class', d => {
              if (d.note === 'rest') return `g-key g-key__rest`;
              if (d.sharp === true) return `g-key g-key__black`;
              return `g-key g-key__white`;
            })
          )
          .attr(
            'transform',
            d => `translate(${d.coord.x.min}, ${d.coord.y.min})`
          );

        $keyGroup
          .selectAll('.key')
          .data(d => [d])
          .join(enter =>
            enter
              .append('rect')
              .attr('class', d => {
                if (d.note === 'rest') return `key key__rest`;
                if (d.sharp === true) return `key key__black`;
                return `key key__white`;
              })
              .attr('data-midi', d => d.midi)
          )
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d => d.coord.x.max - d.coord.x.min)
          .attr('height', d => d.coord.y.max - d.coord.y.min)
          .classed('active', d => activeKeys.includes(d.midi));

        adjustFigureDimensions();

        const restExists = pianoData.filter(d => d.midi === 0);

        if (restExists.length) {
          // if there's a rest key, add it and add text

          // add text to rest key
          $vis
            .select('.g-key__rest')
            .append('text')
            .text('rest')
            .attr(
              'transform',
              `translate(${whiteHeight / 2}, ${whiteWidth / 2})`
            )
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('fontSize', whiteWidth >= 100 ? 18 : 14);
        }

        // raise black keys on top of white ones in DOM
        $vis.selectAll('.g-key__black').raise();

        // setup scales for sequence guides
        const durations = guideData.map(d => d.duration);
        const uniqueDurations = findUnique(durations);
        scaleXGuide
          .range([0, width * 0.75])
          .domain(d3.range(0, guideData.length))
          .padding(0.1);

        const bandwidth = Math.round(scaleXGuide.bandwidth());

        scaleGuideBlock
          .range([Math.min(whiteWidth, bandwidth / 2), bandwidth])
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
          .style('fill', KEY_COLOR)
          .transition()
          .duration(100)
          .style('fill', d => (d.sharp === true ? '#000' : '#fff'));

        const keyData = key.data();
        const { coord, midi } = keyData[0];

        const $note = $gSeq
          .append('rect')
          .attr('class', 'note')
          .classed('is-correct', true);

        $note
          .attr('x', coord.x.min)
          .attr('y', coord.y.min)
          .attr('width', scaleGuideBlock(2 ** 3))
          .attr('height', whiteWidth)
          .transition()
          .duration(1000)
          .ease(d3.easeQuadOut)
          .attr('x', -width);
      },
      clear() {
        $vis.selectAll('.sequence').remove();
      },
      update({ sequenceProgress, jump }) {
        const ANIMATION_DURATION = jump ? 0 : 50;
        const $group = $vis.select('.g-notes');

        const $seq = $group
          .selectAll('.sequence')
          .data(sequenceProgress, d => d.index)
          .join(enter =>
            enter
              .append('g')
              .attr('class', 'sequence')
              .attr('data-order', d => d.index)
          );

        const $noteGroup = $seq
          .selectAll('.g-note')
          .data(d => d.notes)
          .join(enter => {
            const group = enter
              .append('g')
              .attr('class', 'g-note')
              .attr('transform', d => {
                const coord = keyMap.get(+d[0]);
                return `translate(${width * 0.9}, ${coord.y.min})`;
              });

            group
              .append('rect')
              .attr('class', 'note')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', d => scaleGuideBlock(2 ** d[1]))
              .attr('height', whiteWidth)
              .classed('is-correct', (d, i) => isCorrect(d, i));

            group
              .append('text')
              .text(d => d[2])
              .attr('alignment-baseline', 'middle')
              .attr('transform', `translate(2, ${whiteWidth / 2})`);

            group
              .transition()
              .duration(ANIMATION_DURATION)
              .ease(d3.easeQuadOut)
              .attr('transform', (d, i) => {
                const coord = keyMap.get(+d[0]);
                return `translate(${scaleXGuide(i)}, ${coord.y.min})`;
              });

            // highlight played key
            const noteData = group.data();

            const $playedKey = $vis.selectAll('.key').filter((d, i, n) => {
              const midi = +d3.select(n[i]).attr('data-midi');
              const played = noteData[0][0];
              return midi === played;
            });

            $playedKey
              .transition()
              .duration(100)
              .style('fill', d => KEY_COLOR)
              .transition()
              .duration(100)
              .style('fill', d => (d.sharp === true ? '#000' : '#fff'));
          });
      },
      moveSequence({ index, jump, duration }) {
        const seqIndex = index;
        const ANIMATION_DURATION = jump ? 0 : 200;
        const ANIMATION_DELAY = jump ? 0 : duration;

        // set the just finished sequence class to finished
        const $justFinished = $vis
          .selectAll('.sequence')
          .filter((d, i, n) => {
            const order = d3.select(n[i]).attr('data-order');
            return order === `${seqIndex}`;
          })
          .classed('finished', true);

        $justFinished
          .selectAll('.g-note')
          .transition()
          .delay(ANIMATION_DELAY)
          .duration(ANIMATION_DURATION)
          .ease(d3.easeQuadOut)
          .attr(
            'transform',
            (d, i) => `translate(${scaleXGuide(i)}, ${keyboardHeight})`
          );
        // .attr('y', keyboardHeight);

        const $allFinished = $vis.selectAll('.finished').nodes();
        $allFinished.forEach((g, index) => {
          const played = d3.select(g);
          // const staticPlayed = played.attr('data-static');
          const slot = $allFinished.length - index;

          played
            .transition()
            .delay(ANIMATION_DELAY)
            .duration(ANIMATION_DURATION)
            .attr(
              'transform',
              `translate(0, ${(whiteWidth + PADDING) * slot})`
            );
        });
      },
      // pause animations?
      pause() {
        // console.log('paused');
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
