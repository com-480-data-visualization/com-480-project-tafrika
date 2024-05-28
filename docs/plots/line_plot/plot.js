const margin = {top: 20, right: 220, bottom: 30, left: 50},
    width = 900 - margin.left - margin.right,
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
    .y(d => y(d.metric));

const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const metricSelect = d3.select("#metricSelect");
const playerSelect = d3.select("#playerSelect");
const seasonSelect = d3.select("#seasonSelect");
const positionSelect = d3.select("#positionSelect");
const teamSelect = d3.select("#teamSelect");

const playerCard = {
    name: document.getElementById("playerName"),
    position: document.getElementById("playerPosition"),
    team: document.getElementById("playerTeam"),
    points: document.getElementById("playerPoints"),
    three_points_attempted: document.getElementById("player3ptsAttempted"),
    fgm: document.getElementById("playerFGM"),
    three_points_made: document.getElementById("player3ptsMade"),
    image: document.getElementById("playerImage")
  };

d3.csv("stats_per_quarter.csv").then(data => {
  data.forEach(d => {
    d.PTS_PER_QUARTER = +d.PTS_PER_QUARTER;
    d.THREE_PTS_MADE_COUNT = +d.THREE_PTS_MADE_COUNT;
    d.FIELD_GOAL_PERCENTAGE = +d.FIELD_GOAL_PERCENTAGE;
    d.THREE_PTS_PERCENTAGE_MADE = +d.THREE_PTS_PERCENTAGE_MADE;
    d.QUARTER = +d.QUARTER - 1;
    d.PLAYER_ID = d.PLAYER_ID;
  });

  console.log("Data loaded:", data);

  const players = [...new Set(data.map(d => d.PLAYER_NAME))];
  const seasons = [...new Set(data.map(d => d.SEASON_2))];
  const positions = [...new Set(data.map(d => d.POSITION))];
  const teams = [...new Set(data.map(d => d.TEAM_NAME))];

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

    positionSelect.selectAll("option")
    .data(positions)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

    teamSelect.selectAll("option")
        .data(teams)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    
  playerSelect.on("change", () => {
    updatePlayerCard();
    update();
  });
  metricSelect.on("change", update);
  positionSelect.on("change", () => {
    updatePlayerSelect();
    update();
  });
  teamSelect.on("change", () => {
    updatePlayerSelect();
    update();
  });
    
  function updatePlayerSelect() {
    const selectedSeason = seasonSelect.node().value;
    const selectedPosition = positionSelect.node().value;
    const selectedTeam = teamSelect.node().value;

    let filteredPlayers = data.filter(d => d.SEASON_2 === selectedSeason);

    if (selectedPosition !== "all") {
      filteredPlayers = filteredPlayers.filter(d => d.POSITION === selectedPosition);
    }

    if (selectedTeam !== "all") {
      filteredPlayers = filteredPlayers.filter(d => d.TEAM_NAME === selectedTeam);
    }

    const players = [...new Set(filteredPlayers.map(d => d.PLAYER_NAME))];

    playerSelect.selectAll("option").remove();

    playerSelect.selectAll("option")
        .data(players)
        .enter()
        .append("option")
        .text(d => d);

    updatePlayerCard();
    }

  function updatePlayerCard() {
        const selectedPlayer = playerSelect.node().value;
        const selectedSeason = seasonSelect.node().value;
        const playerData = data.filter(d => d.PLAYER_NAME === selectedPlayer && d.SEASON_2 === selectedSeason);
    
        if (playerData.length > 0) {
          const player = playerData[0]; // Assuming data contains consistent records for each player/season
    
          playerCard.name.textContent = player.PLAYER_NAME;
          playerCard.position.textContent = player.POSITION;
          playerCard.team.textContent = player.TEAM_NAME;
          playerCard.points.textContent = d3.mean(playerData, d => d.PTS_PER_QUARTER).toFixed(2);
          playerCard.three_points_attempted.textContent = d3.mean(playerData, d => d.THREE_PTS_MADE_COUNT).toFixed(2);
          playerCard.fgm.textContent = d3.mean(playerData, d => d.FIELD_GOAL_PERCENTAGE).toFixed(2);
          playerCard.three_points_made.textContent = d3.mean(playerData, d => d.THREE_PTS_PERCENTAGE_MADE).toFixed(2);
          playerCard.image.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player.PLAYER_ID}.png`;
        } else {
          playerCard.name.textContent = "Player Name";
          playerCard.position.textContent = "N/A";
          playerCard.team.textContent = "N/A";
          playerCard.points.textContent = "N/A";
          playerCard.rebounds.textContent = "N/A";
          playerCard.assists.textContent = "N/A";
        }
      }

  function update() {

    const selectedPlayer = playerSelect.node().value;
    const selectedSeason = seasonSelect.node().value;
    const selectedMetric = metricSelect.node().value;
    const selectedPosition = positionSelect.node().value;
    const selectedTeam = teamSelect.node().value;

    console.log("Selected Player:", selectedPlayer);
    console.log("Selected Season:", selectedSeason);
    console.log("Selected Metric:", selectedMetric);
    console.log("Selected Position:", selectedPosition);
    console.log("Selected Team:", selectedTeam);

    let filteredData = data.filter(d => d.SEASON_2 === selectedSeason);

    if (selectedPosition !== "all") {
        filteredData = filteredData.filter(d => d.POSITION === selectedPosition);
      }
  
    if (selectedTeam !== "all") {
        filteredData = filteredData.filter(d => d.TEAM_NAME === selectedTeam);
      }

    console.log("Filtered Data:", filteredData);

    const groupedData = d3.group(filteredData, d => d.PLAYER_NAME);

    console.log("Grouped Data:", groupedData);

    console.log("Array from grouped data:", Array.from(groupedData))

    x.domain([0, 3]);
    y.domain([0, d3.max(data, d => d[selectedMetric])]);

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
        .attr("d", d => {
            const lineData = d[1].map(item => ({...item, metric: item[selectedMetric]}));
            return line(lineData);
          })
        .on("click", function(event, d) {
            const clickedPlayer = d[0];
            playerSelect.property("value", clickedPlayer);
            update();
          });

    const playerData = groupedData.get(selectedPlayer);

    console.log("Player data:", playerData);

    if (playerData) {
      const lineData = playerData.map(item => ({...item, metric: item[selectedMetric]}));
      svg.append("path")
          .datum(lineData)
          .attr("class", "line highlight")
          .attr("d", line);
    }
  }

  updatePlayerSelect();
  update();
});
