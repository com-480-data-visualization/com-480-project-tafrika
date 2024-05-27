// Width and height of the SVG
const width = 400;
const height = 400;

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

// Sample data points
// const data = [
//     { x: 50, y: 9.2, r: 10 },
// ];


// Function to update the plot
function updatePlot(data) {
    //var data = structuredClone(orig_data);
    console.log("updatePlot", data);
    if (season == season_default || team == team_default || player == player_default) {
        return;
    }

    terrain_center = { x: 50, y: 10.5 };
    data = data.filter(d => (d["team_name"] == team) && (d["season"] == season) && (d["player_name"] == player));
    filter_selections.forEach(filter => {
        //console.log(filter, data);
        if (filter.value != "all") {
            data = data.filter(d => d[filter.column] == filter.value);
        }
    });

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
}

season_default = "--Season--";
team_default = "--Team--";
player_default = "--Player--";

season = season_default;
team = team_default;
player = player_default;
handle_selection_displays({ season: season, team: team, player: player });



filter_fields = [
    { "column": "SHOT_TYPE", "label": "Shot Type", "values": ['3PT Field Goal', '2PT Field Goal'] },
    {
        "column": "BASIC_ZONE", "label": "Basic Zone", "values": ['Left Corner 3', 'Above the Break 3', 'Restricted Area', 'Mid-Range', 'In The Paint (Non-RA)', 'Right Corner 3', 'Backcourt']
    },
    {
        "column": "ZONE_RANGE", "label": "Shot Zone Range", "values": ['24+ ft.', 'Less Than 8 ft.', '8-16 ft.', '16-24 ft.', 'Back Court Shot']
    },
    {
        "column": "ZONE_NAME", "label": "Zone Name", "values": ['Left Side', 'Center', 'Left Side Center', 'Right Side Center', 'Right Side', 'Back Court']
    },
    {
        "column": "ZONE_ABB", "label": "Shot Zone Basic", "values": ['L', 'C', 'LC', 'RC', 'R', 'BC']
    }

];



filter_selections = [];
filter_fields.forEach(filter => {
    filter_selections.push({ "column": filter.column, "value": "all" });
});


// Load data from a JSON file
d3.csv("df_plot_1.csv").then(data => {
    console.log(data);
    data = data.map(d => {
        return {
            x: (parseFloat(d["LOC_X"]) + 25) / 50 * 100,
            y: parseFloat(d["LOC_Y"]) / 50 * 100,
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
    create_dropdown_filters(data);


    d3.select("#season-select").on("change", function () {
        season = d3.select(this).property('value');
        update_list("#team-select", get_teams_list(data, season));
        update_list("#player-select", get_players_list(data, season, team));
        handle_selection_displays({ season: season, team: team, player: player });
        updatePlot(data);
    });
    d3.select("#team-select").on("change", function () {
        team = d3.select(this).property('value');
        players = get_players_list(data, season, team);
        update_list("#player-select", players);
        handle_selection_displays({ season: season, team: team, player: player });
        updatePlot(data);
    }
    );
    d3.select("#player-select").on("change", function () {
        player = d3.select(this).property('value');
        handle_selection_displays({ season: season, team: team, player: player });
        updatePlot(data);
    });
});



function get_players_list(data, season, team) {
    players = data.filter(d => (d["team_name"] == team) && (d["season"] == season)).map(d => d["player_name"]);
    players = [...new Set(players)];
    players = [player_default, ...players];
    return players;
}


function get_teams_list(data, season) {
    teams = data.filter(d => (d["season"] == season)).map(d => d["team_name"]);
    teams = [...new Set(teams)];
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

    show_team_selector = has_selected_season;

    if (show_team_selector) {
        // show the team selector
        d3.select("#team-select").style("display", "block");
    }
    else {
        // hide the team selector
        d3.select("#team-select").style("display", "none");
    }
    show_player_selector = has_selected_season && has_selected_team;



    if (show_player_selector) {
        // show the player selector
        d3.select("#player-select").style("display", "block");
    }
    else {
        // hide the player selector
        d3.select("#player-select").style("display", "none");
    }
    if (show_player_selector && has_selected_player) {
        // show the filter menu
        d3.select("#filter-container").style("display", "block");
    } else {
        // hide the player filter
        d3.select("#filter-container").style("display", "none");
    }
}



function create_dropdown_filters(data) {
    filter_fields.forEach(filter => {
        // Create the dropdown
        const dropdown = d3.select("#filter-container")
            .append("div")
            .attr("class", "dropdown-filter");

        // Add the label
        dropdown.append("label")
            .attr("for", filter.column)
            .text(filter.label);

        // Add the select
        const select = dropdown.append("select")
            .attr("id", filter.column)
            .attr("name", filter.column);


        // add the default option
        select.append("option")
            .attr("value", "all")
            .text("All");
        // Add the options
        filter.values.forEach(value => {
            select.append("option")
                .attr("value", value)
                .text(value);
        });

        // Add the event listener
        select.on("change", function () {
            filter_selections.filter(f => f.column == filter.column)[0].value = d3.select(this).property('value');
            updatePlot(data);
        });

    }
    );

}
