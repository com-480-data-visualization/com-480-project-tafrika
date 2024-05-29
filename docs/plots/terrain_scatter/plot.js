// Width and height of the SVG
const width = 550;
const height = 550;

// Append SVG to the body of the page and set the width and height
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("style", "outline: solid black 2px;")
    .attr("width", width)
    .attr("height", height);

// Append the background image to the SVG
svg.append("image")
    .attr("xlink:href", "basketball_court.png")  // Specify your image path here
    .attr("width", width)
    .attr("height", height);


const playerCard = {
    name: document.getElementById("playerName"),
    position: document.getElementById("playerPosition"),
    team: document.getElementById("playerTeam"),
    totalCount: document.getElementById("playerTotalCount"),
    madePercentage: document.getElementById("playerMadePercentage"),
    image: document.getElementById("playerImage")
};

// Sample data points
// const data = [
//     { x: 50, y: 9.2, r: 10 },
// ];


// Function to update the plot
function updatePlot(data) {
    if (season == season_default || team == team_default || player == player_default) {
        return;
    }

    terrain_center = { x: 50, y: 10.5 };
    data = data.filter(d => (d["team_name"] == team) && (d["season"] == season) && (d["player_name"] == player));
    if (filter_selection.column != filter_selection_default.column && filter_selection.value != filter_selection_default.value) {
        data = data.filter(d => d[filter_selection.column] == filter_selection.value);
    }

    const circles = svg.selectAll("circle").data(data);
    //value_domain = d3.extent(data, d => d[value_shown]);
    scales = {
        x: d3.scaleLinear().domain([0, 100]).range([0, width]),
        y: d3.scaleLinear().domain([0, 100]).range([height, 0])
        //r: d3.scaleLinear().domain(value_domain).range([0, 5])
    };
    //var colorMap = d3.scaleSequential().domain(value_domain).interpolator(d3.interpolateRgb("red", "green"));

    var colorMap = function (d) {
        if (d == "True") {
            return "green";
        } else {
            return "red";
        }
    };

    circles.enter().append("circle")
        .merge(circles)
        .attr("cx", d => scales["x"](d["x"]))
        .attr("cy", d => scales["y"](d["y"]))
        .attr("r", d => 4)
        .style("fill", d => colorMap(d["made"]))
        .style("opacity", 0.6);

    circles.exit().remove();
    playerData = data[0];
    updatePlayerCard(data, playerData);
}

season_default = "--Season--";
team_default = "--Team--";
player_default = "--Player--";
const filter_selection_default = { "column": "None", "value": "All" };

season = season_default;
team = team_default;
player = player_default;
filter_selection = structuredClone(filter_selection_default);



filter_fields = [
    { "column": "SHOT_TYPE", "label": "Shot Type", "values": ['All', '3PT Field Goal', '2PT Field Goal'] },
    {
        "column": "BASIC_ZONE", "label": "Basic Zone", "values": ['All', 'Left Corner 3', 'Above the Break 3', 'Restricted Area', 'Mid-Range', 'In The Paint (Non-RA)', 'Right Corner 3', 'Backcourt']
    },
    {
        "column": "ZONE_RANGE", "label": "Shot Zone Range", "values": ['All', 'Less Than 8 ft.', '8-16 ft.', '16-24 ft.', '24+ ft.', 'Back Court Shot']
    },
    {
        "column": "ZONE_NAME", "label": "Zone Name", "values": ['All', 'Left Side', 'Left Side Center', 'Center', 'Right Side Center', 'Right Side', 'Back Court']
    },
    {
        "column": "ZONE_ABB", "label": "Shot Zone Basic", "values": ['All', 'L', 'C', 'LC', 'RC', 'R', 'BC']
    }

];




handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });


// Load data from a JSON file
d3.csv("df_plot_1.csv").then(data => {
    data = data.map(d => {
        return {
            x: ((parseFloat(d["LOC_X"]) + 25) / 50 * 100),
            y: ((parseFloat(d["LOC_Y"])) / 50 * 100),
            player_id: (d["PLAYER_ID"]),
            player_name: (d["PLAYER_NAME"]),
            season: (d["SEASON"]),
            made: (d["SHOT_MADE"]),
            team_id: (d["TEAM_ID"]),
            team_name: (d["TEAM_NAME"]),
            SHOT_TYPE: (d["SHOT_TYPE"]),
            BASIC_ZONE: (d["BASIC_ZONE"]),
            ZONE_RANGE: (d["ZONE_RANGE"]),
            ZONE_NAME: (d["ZONE_NAME"]),
            ZONE_ABB: (d["ZONE_ABB"]),

        };
    }
    );

    seasons = [...new Set(data.map(d => d["season"]))];
    seasons = [season_default, ...seasons];
    teams = [...new Set(data.map(d => d["team_name"]))];
    teams = [team_default, ...teams];
    players = [player_default];

    update_list("#season-select", seasons);
    update_list("#team-select", teams);
    update_list("#player-select", players);

    filter_columns = filter_fields.map(f => f.column);
    filter_columns = ["None", ...filter_columns];
    update_list("#filter-column-select", filter_columns);


    //create_dropdown_filters(data);


    d3.select("#season-select").on("change", function () {
        season = d3.select(this).property('value');
        update_list("#team-select", get_teams_list(data, season));
        update_list("#player-select", get_players_list(data, season, team));
        reset_fields("season");
        handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });

        updatePlot(data);
    });
    d3.select("#team-select").on("change", function () {
        team = d3.select(this).property('value');
        players = get_players_list(data, season, team);
        update_list("#player-select", players);
        reset_fields("team");
        handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });
        updatePlot(data);
    }
    );
    d3.select("#player-select").on("change", function () {
        player = d3.select(this).property('value');
        reset_fields("player");
        handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });
        updatePlot(data);
    });
    d3.select("#filter-column-select").on("change", function () {
        filter_selection.column = d3.select(this).property('value');
        if (filter_selection.column != "None") {
            update_list("#filter-value-select", filter_fields.filter(f => f.column == filter_selection.column)[0].values);
            filter_selection.value = filter_selection_default.value;
        }
        handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });
        updatePlot(data);
    });
    d3.select("#filter-value-select").on("change", function () {
        filter_selection.value = d3.select(this).property('value');
        handle_selection_displays({ season: season, team: team, player: player, filter: filter_selection });
        updatePlot(data);
    }
    );

});



function reset_fields(updated_value) {
    if (updated_value == "season") {
        team = team_default;
        player = player_default;
        // filter_selection = structuredClone(filter_selection_default);
        // filter_columns = filter_fields.map(f => f.column);
        // filter_columns = ["None", ...filter_columns];
        // update_list("#filter-column-select", filter_columns);
    }
    else if (updated_value == "team") {
        player = player_default;
        // filter_selection = structuredClone(filter_selection_default);
        // filter_columns = filter_fields.map(f => f.column);
        // filter_columns = ["None", ...filter_columns];
        // update_list("#filter-column-select", filter_columns);
    }
    else if (updated_value == "player") {
        // filter_selection = structuredClone(filter_selection_default);
        // filter_columns = filter_fields.map(f => f.column);
        // filter_columns = ["None", ...filter_columns];
        // update_list("#filter-column-select", filter_columns);
    }


}


function get_players_list(data, season, team) {
    players = data.filter(d => (d["team_name"] == team) && (d["season"] == season)).map(d => d["player_name"]);
    players = [...new Set(players)];
    players.sort();
    players = [player_default, ...players];
    return players;
}


function get_teams_list(data, season) {
    teams = data.filter(d => (d["season"] == season)).map(d => d["team_name"]);
    teams = [...new Set(teams)];
    teams.sort();
    teams = [team_default, ...teams];
    return teams;
}


function update_list(selector, values) {
    // empty the list
    d3.select(selector).selectAll("option").remove();
    // add the new list
    d3.select(selector).selectAll("option")
        .data(values)
        .enter()
        .append("option")
        .text(d => d);
}




function handle_selection_displays(current_selections) {
    has_selected_player = current_selections["player"] != player_default;
    has_selected_team = current_selections["team"] != team_default;
    has_selected_season = current_selections["season"] != season_default;

    filter_selection = current_selections["filter"];
    has_selected_filter = filter_selection.column != "None";


    show_team_selector = has_selected_season;

    if (show_team_selector) {
        // show the team selector
        d3.selectAll(".team-select-class").style("display", "block");
    }
    else {
        // hide the team selector
        d3.selectAll(".team-select-class").style("display", "none");
    }
    show_player_selector = has_selected_season && has_selected_team;



    if (show_player_selector) {
        // show the player selector
        d3.selectAll(".player-select-class").style("display", "block");
    }
    else {
        // hide the player selector
        d3.selectAll(".player-select-class").style("display", "none");
    }
    if (show_player_selector && has_selected_player) {
        // show the filter menu
        d3.selectAll(".filter-container").style("display", "block");
    } else {
        // hide the player filter
        d3.selectAll(".filter-container").style("display", "none");
    }

    if (show_player_selector && has_selected_player && has_selected_filter) {
        // show the filter menu
        d3.selectAll(".filter-value-select").style("display", "block");
    }
    else {
        // hide the player filter
        d3.selectAll(".filter-value-select").style("display", "none");
    }
}



// function create_dropdown_filters(data) {
//     filter_fields.forEach(filter => {
//         // Create the dropdown
//         const dropdown = d3.select("#filter-container")
//             .append("div")
//             .attr("class", "dropdown-filter");

//         // Add the label
//         dropdown.append("label")
//             .attr("for", filter.column)
//             .text(filter.label);

//         // Add the select
//         const select = dropdown.append("select")
//             .attr("id", filter.column)
//             .attr("name", filter.column);


//         // add the default option
//         select.append("option")
//             .attr("value", "all")
//             .text("All");
//         // Add the options
//         filter.values.forEach(value => {
//             select.append("option")
//                 .attr("value", value)
//                 .text(value);
//         });

//         // Add the event listener
//         select.on("change", function () {
//             filter_selections.filter(f => f.column == filter.column)[0].value = d3.select(this).property('value');
//             updatePlot(data);
//         });

//     }
//     );

// }



function updatePlayerCard(filtered_data, playerData) {
    if (playerData) {

        totalCount = filtered_data.length;
        shotsMade = filtered_data.filter(d => d.made == "True").length;
        playerCard.name.textContent = playerData.player_name;
        playerCard.team.textContent = playerData.team_name;
        playerCard.totalCount.textContent = totalCount;
        playerCard.madePercentage.textContent = String((shotsMade / totalCount * 100).toFixed(2)) + "%";
        playerCard.image.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerData.player_id}.png`;
    } else {

        playerCard.name.textContent = "Player Name";
        playerCard.position.textContent = "N/A";
        playerCard.team.textContent = "N/A";
        playerCard.points.textContent = "N/A";
        playerCard.rebounds.textContent = "N/A";
        playerCard.assists.textContent = "N/A";
    }
}