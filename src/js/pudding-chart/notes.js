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
            const { midis } = data.range;
            const range = d3.range(midis[0], midis[1]);
            console.log({ range, data, test: d3.range(0, 5) });
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
                generatePiano();

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
