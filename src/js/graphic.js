/* global d3 */
import loadData from "./load-data";

function resize() {}

function handleDataLoad(data) {
  console.log(data);
  d3.select(".start span").text(data.start);
  d3.select(".updated span").text(data.updated);
  const enter = e => {
    const tr = e.append("tr");
    tr.append("td").text(d => d.title);
    tr.append("td").text(d => d.odds);
    tr.append("td").text(d => d.est);
    tr.append("td").text(d => d.apm);
    tr.append("td").text(d => (d.result ? d.result.attempts : "NA"));
    tr.append("td").text(d =>
      d.result && d.result.done ? d.result.end : "NA"
    );
    return tr;
  };

  d3.select("table tbody")
    .selectAll("tr")
    .data(data.levels)
    .join(enter);
}

function init() {
  const v = Date.now();
  const dataURL = `https://pudding.cool/2020/04/infinite-data/data.json?version=${v}`;
  loadData(dataURL)
    .then(handleDataLoad)
    .catch(console.log);
}

export default { init, resize };
