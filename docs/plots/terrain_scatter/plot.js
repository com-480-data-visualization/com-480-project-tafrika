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
const data = [
    { x: 50, y: 9.2, r: 10 },
];


// Function to update the plot
function updatePlot(data, value_shown, ditance_shown) {

    terrain_center = { x: 50, y: 10.5 };
    dist = function (a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    };
    data = data.filter(d => dist(terrain_center, d) > ditance_shown);
    const circles = svg.selectAll("circle").data(data);
    value_domain = d3.extent(data, d => d[value_shown]);
    console.log(value_domain);
    scales = {
        x: d3.scaleLinear().domain([0, 100]).range([0, width]),
        y: d3.scaleLinear().domain([0, 100]).range([height, 0]),
        r: d3.scaleLinear().domain(value_domain).range([0, 5])
    };
    var colorMap = d3.scaleSequential().domain(value_domain).interpolator(d3.interpolateRgb("red", "green"));

    circles.enter().append("circle")
        .merge(circles)
        .attr("cx", d => scales["x"](d["x"]))
        .attr("cy", d => scales["y"](d["y"]))
        .attr("r", d => scales["r"](d[value_shown]))
        .style("fill", d => colorMap(d[value_shown]))
        .style("opacity", 0.6);

    circles.exit().remove();
}

value = "score";
distance = 0;

// Load data from a JSON file
d3.json("plot_terrain.json").then(data => {
    // Initial plot
    updatePlot(data, value, distance);

    // Listen to dropdown changes
    d3.select("#value-select").on("change", function () {

        let new_value = d3.select(this).property('value');
        value = new_value;
        updatePlot(data, new_value, distance);
    });
    d3.select("#distance-select").on("change", function () {
        let new_distance = d3.select(this).property('value');
        distance = new_distance;
        updatePlot(data, value, new_distance);
    }
    );
});

