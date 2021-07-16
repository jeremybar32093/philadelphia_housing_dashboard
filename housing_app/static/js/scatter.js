// 1.) Set SVG width, height, and margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100,
};

// 2.) Set width and height of actual graphic based on margins and width/height of svg
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// 3.) Create an SVG wrapper, append an SVG group that will hold our chart,
//     and shift the latter by left and top margins.
//     SVG will go within div that has class "scatter"
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// 4.) Append an SVG group and translate based on margins defined above
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// 5.) Set initial parameters to be used for x and y axes
var chosenXAxis = "avgPrice";
var chosenYAxis = "frontage";

// 6.) Read in JSON from API route
const url = "api/v1.0/data"
d3.json(url).then(function(response, err) {
    if (err) throw err;

    // 6a.) Update datatypes to numeric
    
    console.log(response);
});