
let circles;
let combinedData;
let playerData;
let playoffData;
let metric_1_Select;
let metric_2_Select;
let catSelect;
let yearsDict;
let xScale;
let yScale;
let colorScale;
let playerName;
let curTeam;
let dropdownsActive = false;

// dimensions
const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

this.svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Get the svg dimensions

let teamToID = {}; // dictionary converting team nickname to team_id
const metricsDict = {
    //PLAYER_ID,points_per_game,three_pts_made,fg_made,field_goal_percentage,three_pts_percentage,dribbles_per_shot,touch_time_per_shot,defender_distance_per_shot,fg_pct_when_defender,average_distance_when_defender,total_defended_shots,PLAYER_NAME,TEAM_NAME,POSITION,POSITION_GROUP
    "Points per game": "points_per_game",
    "Three pointers made": "three_pts_made",
    "Field goals made": "fg_made",
    "Field goal percentage": "field_goal_percentage",
    "Three point percentage": "three_pts_percentage",
    "Dribbles per shot": "dribbles_per_shot",
    "Touch time per shot": "touch_time_per_shot",
    "Defender distance per shot": "defender_distance_per_shot",
    "Field goal percentage when defended": "fg_pct_when_defender",
    "Average distance when defended": "average_distance_when_defender",
    "Total defended shots": "total_defended_shots",
};

function roundToTwoDecimals(number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}

function mouseOver(event, d) {
    const prevR = d3.select(this).attr("r");
    const prevColour = d3.select(this).style("fill");

    d3.select(this)
        .transition()
        .duration(200)
        .attr("original-size", prevR)
        .attr("r", 6) // Enlarge the circle slightly
        .attr("original-colour", prevColour)
        .style("fill", "orange");

    // Select the player container to create the player card
    var playerContainer = d3.select("#player-container");

    // Clear existing contents
    playerContainer.html("");

    // Create a box to enclose the player card
    const infoBox = playerContainer
        .append("div")
        .attr("class", "player-card");

    var playerId = d['PLAYER_ID']
    // if the player id is successfully recovered, add the player headshot
    if (playerId !== null) {
        // Append the player image
        infoBox
            .append("img")
            .attr("class", "player-image")
            .attr(
                "src",
                "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/" +
                playerId +
                ".png"
            );
    }

    // Append the player name
    infoBox
        .append("div")
        .attr("class", "player-name")
        .text(d['PLAYER_NAME'] + " (" + d['TEAM_NAME'] + ")");

    // Append the stats
    infoBox
        .append("div")
        .attr("class", "stat-name")
        .text(metricSelect.property("value") + ": " + roundToTwoDecimals(d[metric_1_Select]) + " " + m.property("value"))
        .append("div")
        .attr("class", "player-stat")
        .text("Regular Season: " + roundToTwoDecimals(d[me]))
        .append("div")
        .attr("class", "player-stat")
        .text("Playoffs: " + roundToTwoDecimals(d.po_stat));

}

function mouseOut(event, d) {
    const originalSize = d3.select(this).attr("original-size");
    const originalColour = d3.select(this).attr("original-colour");
    d3.select(this)
        .transition()
        .duration(200)
        .style("fill", originalColour)
        .attr("r", originalSize); // Restore the original circle size

    // Remove the player information
    d3.select("#player-container").html("");
}

function mouseInteractions() {
    circles
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);
}

function clearScatter() {
    svg.selectAll("circle").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();
    svg.selectAll(".axis-title").remove();
}

function clearLegend() {
    var legendContainer = d3.select("#legend-container");
    legendContainer.selectAll("*").remove();
}

function generateEvenlySpacedColor(
    cur_idx,
    total_colors,
    minHue = 0,
    maxHue = 360,
    reversed = false
) {
    var prop = cur_idx / total_colors;
    if (reversed) {
        prop = 1 - prop;
    }
    return d3.hsv((maxHue - minHue) * prop + minHue, 0.5, 0.9);
}

function generateColorScale(
    domainValues,
    minHue = 0,
    maxHue = 360,
    reversed = false
) {
    let genColorScale;
    var colors = [];

    // Generate n distinct colors
    for (var i = 0; i < domainValues.length; i++) {
        var color = generateEvenlySpacedColor(
            i,
            domainValues.length,
            minHue,
            maxHue,
            reversed
        );
        colors.push(color);
    }

    genColorScale = d3.scaleOrdinal().domain(domainValues).range(colors);

    return genColorScale;
}

function getTeamLogo(team) {
    if (team === "BRK") {
        team = "BKN";
    } else if (team === "PHO") {
        team = "PHX";
    }
    return "logos/" + team + "_2023.png";
}

function createLegend(legendArray, isTeam = false) {
    var legendContainer = d3.select("#legend-container");
    legendContainer.selectAll("*").remove();

    // Create legend items
    var legendItems = legendContainer
        .selectAll(".legend-item")
        .data(legendArray)
        .enter()
        .append("div")
        .attr("class", "legend-item");

    // Add color squares to legend items
    legendItems
        .append("div")
        .attr("class", "legend-color")
        .style("background-color", function (d) {
            return colorScale(d);
        });

    // Add text labels to legend items
    legendItems
        .append("div")
        .style("font-size", "14px")
        .text(function (d) {
            return d;
        });

    if (isTeam) {
        // Add team images to legend items
        legendItems
            .append("img")
            .attr("class", "team-logo")
            .attr("src", getTeamLogo);
    }

    d3.selectAll(".legend-item").on("click", function () {
        var clickedElem = d3.select(this).select(".legend-color");
        var clickedColor = clickedElem.style("background-color");

        // Check if the clicked item is already selected
        var isSelected = clickedElem.classed("selected");

        // Remove the "selected" class from all legend items
        d3.selectAll(".legend-item .legend-color").classed("selected", false);

        // Toggle the selected class on the clicked item
        clickedElem.classed("selected", !isSelected);

        // Filter the circles based on the clicked color
        if (isSelected) {
            // Show all groups if the item was previously selected
            circles.style("display", "block");
            d3.selectAll(".legend-item").style("opacity", 1);
        } else {
            d3.selectAll(".legend-item").style("opacity", 0.5);
            d3.select(this).style("opacity", 1);
            // Otherwise, show only the selected group
            circles.style("display", function () {
                var circleColor = d3.select(this).attr("fill");
                return circleColor === clickedColor ? "block" : "none";
            });
        }
    });
}

function getPlayerId(full_name) {
    const player = playerData.find(
        (player) => player.display_first_last === full_name
    );
    if (player) {
        return player.person_id;
    }
    return null; // Return null if no player is found. shouldn't happen tho since every player is successfully joined using this ds
}

/*** 
 * Function to handle the team dropdown 
*/
function handleTeam(changeScale) {
    var teams = new Set();
    Object.values(playoffData).forEach((element) => {
        if (element.TEAM_NAME) teams.add(element.TEAM_NAME);
    });
    let sortedTeams = Array.from(teams);
    sortedTeams.sort();
    if (changeScale) colorScale = generateColorScale(sortedTeams);
    circles.attr("fill", function (d) {
        return colorScale(d.TEAM_NAME);
    });
    createLegend(sortedTeams, true);
}

/***
 * Function to handle the position dropdown
 */
function handlePosition(changeScale) {
    var positions = new Set();
    playerData.forEach((element) => {
        if (element.POSITION) positions.add(element.POSITION);
    });
    if (changeScale) colorScale = generateColorScale(Array.from(positions));
    circles.attr("fill", function (d) {
        return colorScale(d.matchedItem.POSITION);
    });

    createLegend(positions);
}

/***
 * Function to handle the position group dropdown
 */
function handlePositionGroup(changeScale) {
    var positionGroups = new Set();
    playerData.forEach((element) => {
        if (element.POSITION_GROUP) positionGroups.add(element.POSITION_GROUP);
    });
    if (changeScale) colorScale = generateColorScale(Array.from(positionGroups));
    circles.attr("fill", function (d) {
        return colorScale(d.matchedItem.POSITION_GROUP);
    });
}

/***
 * Function to create categries for the dropdown
 */
function createCategoryDD() {
    catSelect = d3.select("#category").attr("id", "category");
    catSelect.style("display", "block");
    const categories = ["--Category--", "Position", "Position Category", "Team"];
    populateDropdown(catSelect, categories);
    catSelect.on("change", function () {
        handleSelect(false, true);
    });
}

function fillPlot() {
    const dataArray = Object.values(playerData);

    createCategoryDD();

    const xExtent = d3.extent(dataArray, (d) => d.rs_stat);
    const yExtent = d3.extent(dataArray, (d) => d.po_stat);
    const maxExtent = Math.max(
        Math.abs(xExtent[0]),
        Math.abs(xExtent[1]),
        Math.abs(yExtent[0]),
        Math.abs(yExtent[1])
    );
    const offset = 1;
    const padding = 50;

    xScale = d3
        .scaleLinear()
        .domain([-maxExtent - offset, maxExtent + offset])
        .range([margin.left + padding, margin.left + width - padding]);

    yScale = d3
        .scaleLinear()
        .domain([-maxExtent - offset, maxExtent + offset])
        .range([margin.top + height - padding, margin.top + padding]);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("+"));
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("+"));

    circles = svg
        .selectAll("circle")
        .data(playoffArray)
        .enter()
        .append("circle")
        .attr("name", (d) => d.player_name)
        .attr("cx", (d) => xScale(d.rs_stat))
        .attr("cy", (d) => yScale(d.po_stat))
        .attr("r", 4)
        .attr("fill", "steelblue");

    svg
        .append("g")
        .attr("transform", `translate(10, ${margin.top + height / 2 + 10})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg
        .append("g")
        .attr("transform", `translate(${margin.left + width / 2 + 10}, 10)`)
        .attr("class", "y-axis")
        .call(yAxis);

    // Add x-axis title
    svg
        .append("text")
        .attr("class", "axis-title")
        .attr("x", width / 2)
        .attr("y", height + margin.top + margin.bottom - 5)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-style", "italic")
        .text("Regular Season " + metricSelect.property("value"));

    // Add y-axis title
    svg
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 25)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-style", "italic")
        .text("Playoff " + metricSelect.property("value"));

    mouseInteractions();
}

function createScatter(metric1, metric2) {
    const xExtent = d3.extent(playerData, (d) => +d[metric1]);
    const yExtent = d3.extent(playerData, (d) => +d[metric2]);
    console.log(xExtent);
    console.log(yExtent);
    xScale = d3
        .scaleLinear()
        .domain(xExtent)
        .range([margin.left, width - margin.right]);

    yScale = d3
        .scaleLinear()
        .domain(yExtent)
        .range([height - margin.bottom, margin.top]);
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".2f"));
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".2f"));
    console.log("xScale:"+xScale.domain());
    console.log("yScale:"+yScale.domain());
    clearScatter();

    circles = svg
        .selectAll("circle")
        .data(playerData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d[metric1]))
        .attr("cy", (d) => yScale(d[metric2]))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);
    console.log(circles);
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    svg.append("text")
        .attr("class", "axis-title")
        .attr("x", width / 2)
        .attr("y", height - 6)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(metric1);

    svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 16)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(metric2);

    mouseInteractions();
}


function populateDropdown(selectElement, options) {
    selectElement
        .selectAll("option")
        .data(options)
        .join("option")
        .attr("value", (d) => d)
        .text((d) => d);
}

function createMetric1DD() {
    metricSelect = d3
        .select("#perf-metric1-select")
        .attr("id", "perf-metric1-select");
    const metricOptions = Object.keys(metricsDict);

    const metricOptionsHeader = ["--Metric 1--", ...metricOptions];
    populateDropdown(metricSelect, metricOptionsHeader);
    return metricSelect;
}
function createMetric2DD() {
    metricSelect = d3
        .select("#perf-metric2-select")
        .attr("id", "perf-metric2-select");
    const metricOptions = Object.keys(metricsDict);

    const metricOptionsHeader = ["--Metric 2--", ...metricOptions];
    populateDropdown(metricSelect, metricOptionsHeader);
    return metricSelect;
}

function handleSelect(metChange, catChange) {
    const selectedMetric1 = metric_1_Select.property("value");
    const selectedMetric2 = metric_2_Select.property("value");

    if (catSelect == null) {
        if (selectedMetric1 != "--Metric 1--" && selectedMetric2 != "--Metric 2--") {
            dropdownsActive = true;
            // Now that both the options are selected, we can present our visualisation
            clearScatter();
            createScatter(metricsDict[selectedMetric1], metricsDict[selectedMetric2]);
        } else {
            dropdownsActive = false;
            clearScatter();
            // Reset, that is, Remove the visualisation (optional)
        }
    } else {
        const category = catSelect.property("value");
        dropdownsActive = false;
        if (
            selectedMetric1 != "--Metric 1--" &&
            selectedMetric2 != "--Metric 2--" &&
            category != "--Category--"
        ) {
            dropdownsActive = true;
            clearScatter();
            createScatter(metricsDict[selectedMetric1], metricsDict[selectedMetric2]);
            if (category == "POSITION") handlePosition(catChange); // Only change the legend if the category is changed
            if (category == "POSITION_GROUP") handlePositionGroup(catChange); // Only change the legend if the category is changed
            if (category == "TEAM_NAME") handleTeam(!metChange); // Have to change if year is changed, since different teams make it to the playoffs
        } else {
            dropdownsActive = false;
            // Reset, that is, Remove the visualisation (optional)
            clearScatter();
            clearLegend();
            createScatter(metricsDict[selectedMetric1], metricsDict[selectedMetric2]);
        }
    }
}
let svg = this.svg;

Promise.all([
    d3.csv("viz2_dataset.csv"),
]).then(function (values) {
    playerData = values[0];

    metric_1_Select = createMetric1DD();
    metric_2_Select = createMetric2DD();

    metric_1_Select.on("change", function () {
        handleSelect(true, false);
    });
    metric_2_Select.on("change", function () {
        handleSelect(true, false);
    });
});

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

function initPlayerPerf() {
    perf_object = new PlayerPerf("scatterPlot", "perfcontainer");
}
