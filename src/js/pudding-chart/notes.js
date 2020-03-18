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

        // animation constants
        let DURATION = 0;
        let DELAY = 0;

        // assuming 120 beats per minute (2 per second or 30 whole notes per minute)
        // assuming 4/4 tempo
        // 1 measure = 1 whole note
        // 1 measure in 2 seconds
        const BPM = data.tempo;
        const minute = 60000;
        const BEAT_LENGTH = Math.floor(minute / BPM);

        // sequences that have already played
        const finishedSeq = [];

        // scales
        const scaleXGuide = d3.scaleBand();
        const scaleGuideBlock = d3.scaleLinear();
        const scaleY = null;
        const scaleColor = d3
            .scaleOrdinal()
            .range(['#FF533D', '#4717F6', '#E5E338', '#A239CA', '#34A29E']);

        // helper functions

        function findUnique(arr) {
            return [...new Set(arr)];
        }

        function findDuration() {
            const correctSeq = data.sequence;
            // quarter note = 1 beat
            // notes length = Math.pow(2, d.duration)
            // beat length * (4 / note length)
            DELAY = correctSeq.map(d =>
                Math.floor(BEAT_LENGTH * (4 / 2 ** d.duration))
            );
            console.log({ DELAY });
            DURATION = d3.sum(DELAY);
        }

        function generatePiano() {
            const { keys } = data;
            const numKeys = keys.length;

            const WIDTH_TO_HEIGHT_RATIO = 0.2;
            const idealWidth = width * 0.25 * WIDTH_TO_HEIGHT_RATIO;
            // does the ideal width make the piano too tall?
            const tooTall = idealWidth * numKeys > height;
            const PIANO_HEIGHT = tooTall
                ? // if so, figure out the widest each key can be
                height / numKeys / WIDTH_TO_HEIGHT_RATIO
                : // otherwise, scale the piano's height based on taking up 1/4 of the svg width
                width * 0.25;
            // const PIANO_WIDTH = PIANO_HEIGHT * WIDTH_TO_HEIGHT_RATIO;
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
                const offset = d.sharp === false ? 0 : -blackWidth / 2;

                return {
                    ...d,
                    coord: {
                        y: {
                            min: whiteWidth * numLowerWhites(d.midi) + offset,
                            max:
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
                note.midi === data.sequence[index].midi &&
                note.duration === data.sequence[index].duration
            );
        }

        function setupNoteGroup(sequence, index) {
            // add location data to played notes
            const seqLoc = sequence.map(d => ({
                midi: +d[0],
                duration: +d[1],
                coord: keyMap.get(+d[0]),
            }));

            // setup a group for each played sequence
            const $gNotes = $vis
                .select('.g-notes')
                .append('g')
                .attr('class', 'sequence')
                .attr('data-order', index);

            // add played notes to group
            const $notes = $gNotes
                .selectAll('.note')
                .data(seqLoc)
                .join(enter =>
                    enter
                        .append('rect')
                        .attr('class', 'note')
                        .attr('data-order', (d, i) => i)
                )
                .attr('x', width * 0.9)
                .attr('y', d => d.coord.y.min)
                .attr('width', d => scaleGuideBlock(1 / d.duration))
                .attr('height', d => d.coord.y.max - d.coord.y.min)
                .style('fill', d => scaleColor(d.midi))
                .classed('is-correct', (d, i) => isCorrect(d, i));

            // for each note, play it
            $notes.each(playNote);
        }

        function playNote() {
            // select the note
            const note = d3.select(this);
            const index = note.attr('data-order');
            const thisDelay = d3.sum(DELAY.slice(0, index));

            // animate it
            note
                .transition()
                .duration(DURATION)
                .delay(thisDelay)
                .attr('x', scaleXGuide(index));
        }

        function moveNoteGroup(index) {
            const $sequences = $gSeq.selectAll('.sequence');
            const group = $sequences.filter(
                (d, i, n) => d3.select(n[i]).attr('data-order') === index
            );

            const notes = $sequences.selectAll('.note');

            finishedSeq.push(index);

            notes
                .transition()
                .duration(200)
                .attr('y', height * 0.5);

            $sequences.attr('data-status', 'finished');

            const $finished = $gSeq.selectAll('[data-status="finished"]').nodes();
            $finished.forEach((g, index) => {
                const played = d3.select(g);
                const slot = $finished.length - index;

                played
                    .transition()
                    .duration(200)
                    .attr('transform', `translate(0, ${(whiteWidth + PADDING) * slot})`);
            });
        }

        const Chart = {
            // called once at start
            init() {
                findDuration();
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

                // set color scale
                scaleColor.domain(activeKeys);

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
                            .attr('class', d =>
                                d.sharp === true ? `key key__black` : `key key__white`
                            )
                            .attr('data-midi', d => d.midi)
                            .classed('active', d => activeKeys.includes(d.midi))
                    )
                    .attr('x', d => d.coord.x.min)
                    .attr('y', d => d.coord.y.min)
                    .attr('width', d => d.coord.x.max - d.coord.x.min)
                    .attr('height', d => d.coord.y.max - d.coord.y.min);

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
                        1 / Math.max(...uniqueDurations),
                        1 / Math.min(...uniqueDurations),
                    ]);

                // append the sequence guides
                $vis
                    .select('.g-guide')
                    .selectAll('.guide')
                    .data(guideData)
                    .join(enter => enter.append('rect').attr('class', 'guide'))
                    .attr('x', (d, i) => scaleXGuide(i))
                    .attr('y', d => d.coord.y.min)
                    .attr('width', d => scaleGuideBlock(1 / d.duration))
                    .attr('height', d => d.coord.y.max - d.coord.y.min)
                    .style('stroke', d => scaleColor(d.midi));

                // if results have already been generated
                if (data.result) {
                    const results = data.result.recent;
                    let seqPromise = Promise.resolve();
                    const interval = DURATION * 2;
                    console.log({ data, results });

                    const filteredResults = results.filter(d => d.length > 1);

                    filteredResults.forEach((d, i) => {
                        seqPromise = seqPromise
                            .then(() => {
                                setupNoteGroup(d, i);
                                return new Promise(resolve => {
                                    setTimeout(resolve, interval);
                                });
                            })
                            .then(() => {
                                moveNoteGroup(i);

                                return new Promise(resolve => {
                                    setTimeout(resolve, interval);
                                });
                            });
                    });

                    seqPromise.then(() => {
                        console.log('loop finished');
                    });
                    // filteredResults.forEach((d, i) => {
                    //     setupNoteGroup(d)
                    // });
                }

                return Chart;
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
