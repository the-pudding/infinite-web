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
        const $axis = null;
        let $vis = null;

        // data
        let data = $chart.datum();
        console.log({ data });

        // dimensions
        let width = 0;
        let height = 0;
        const MARGIN_TOP = 0;
        const MARGIN_BOTTOM = 0;
        const MARGIN_LEFT = 0;
        const MARGIN_RIGHT = 0;

        // scales
        const scaleX = null;
        const scaleY = null;

        // helper functions

        function generatePiano() {
            const { keys } = data;
            // how many white keys are there total?
            const whiteKeys = keys.filter(d => d.sharp === false).length;

            const PIANO_WIDTH = height * 0.6;
            const WIDTH_RATIO = 0.7;
            const WIDTH_TO_HEIGHT_RATIO = 0.2;
            const HEIGHT_RATIO = 0.6;
            const whiteWidth = Math.round(PIANO_WIDTH / whiteKeys);
            const blackWidth = Math.round(whiteWidth * WIDTH_RATIO);
            const whiteHeight = Math.round(whiteWidth / WIDTH_TO_HEIGHT_RATIO);
            const blackHeight = Math.round(whiteHeight * HEIGHT_RATIO);
            console.log({
                minCheck: width - whiteHeight,
                whiteHeight,
                blackHeight,
                whiteWidth,
            });

            // how many white keys came before this key?
            const numLowerWhites = midi =>
                keys.filter(e => e.midi < midi && e.sharp === false).length;

            // return an updated array with key coordinates
            return keys.map((d, i) => {
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

        const Chart = {
            // called once at start
            init() {
                $svg = $chart.append('svg').attr('class', 'graphic__piano');

                // setup viz group
                $vis = $svg.append('g').attr('class', 'g-vis');
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
                const pianoData = generatePiano();

                const $piano = $vis.append('g').attr('class', 'g-piano');

                $piano
                    .selectAll('.key')
                    .data(pianoData)
                    .join(enter => {
                        enter
                            .append('rect')
                            .attr('class', d =>
                                d.sharp === true ? `key key__black` : `key key__white`
                            )
                            .attr('x', d => d.coord.x.min)
                            .attr('y', d => d.coord.y.min)
                            .attr('width', d => d.coord.x.max - d.coord.x.min)
                            .attr('height', d => d.coord.y.max - d.coord.y.min)
                            .attr('data-midi', d => d.midi);

                        // raise black keys on top of white ones in DOM
                        $vis.selectAll('.key__black').raise();
                    });

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
