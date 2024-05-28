const margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const parseDate = d3.timeParse("%Y-%m-%d");

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const xAxis = d3.axisBottom(x).ticks(4).tickFormat((d, i) => ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'][i]);
const yAxis = d3.axisLeft(y);

const line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.QUARTER))
    .y(d => y(d.PTS_PER_QUARTER));

const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const playerSelect = d3.select("#playerSelect");
const seasonSelect = d3.select("#seasonSelect");

d3.csv("stats_per_quarter.csv").then(data => {
  data.forEach(d => {
    d.PTS_PER_QUARTER = +d.PTS_PER_QUARTER;
    d.QUARTER = +d.QUARTER - 1;
  });

  console.log("Data loaded:", data);

  const players = [...new Set(data.map(d => d.PLAYER_NAME))];
  const seasons = [...new Set(data.map(d => d.SEASON_2))];

  seasonSelect.selectAll("option")
      .data(seasons)
      .enter()
      .append("option")
      .text(d => d);

  playerSelect.selectAll("option")
      .data(players)
      .enter()
      .append("option")
      .text(d => d);
  

  seasonSelect.on("change", () => {
    updatePlayerSelect();
    update();
    });
    
  playerSelect.on("change", update);
    
  function updatePlayerSelect() {
    const selectedSeason = seasonSelect.node().value;
    const players = [...new Set(data.filter(d => d.SEASON_2 === selectedSeason).map(d => d.PLAYER_NAME))];

    playerSelect.selectAll("option").remove();

    playerSelect.selectAll("option")
        .data(players)
        .enter()
        .append("option")
        .text(d => d);
    }

  function update() {

    const selectedPlayer = playerSelect.node().value;
    const selectedSeason = seasonSelect.node().value;

    console.log("Selected Player:", selectedPlayer);
    console.log("Selected Season:", selectedSeason);

    const filteredData = data.filter(d => d.PLAYER_NAME === selectedPlayer && d.SEASON_2 === selectedSeason);

    console.log("Filtered Data:", filteredData);

    const groupedData = d3.group(data.filter(d => d.SEASON_2 === selectedSeason), d => d.PLAYER_NAME);

    console.log("Grouped Data:", groupedData);

    console.log("Array from grouped data:", Array.from(groupedData))

    x.domain([0, 3]);
    y.domain([0, d3.max(data, d => d.PTS_PER_QUARTER)]);

    svg.selectAll("*").remove();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll(".line")
        .data(Array.from(groupedData))
        .enter()
        .append("path")
        .attr("class", "line") // d => d[0] === selectedPlayer ? "line highlight" : "line")
        .attr("d", d => line(d[1]))
        .on("click", function(event, d) {
            const clickedPlayer = d[0];
            playerSelect.property("value", clickedPlayer);
            update();
          });

    const playerData = groupedData.get(selectedPlayer);

    console.log("Player data:", playerData);

    if (playerData) {
      svg.append("path")
          .datum(playerData)
          .attr("class", "line highlight")
          .attr("d", line);
    }
  }

  update();
});
