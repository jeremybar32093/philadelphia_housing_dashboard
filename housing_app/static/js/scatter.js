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

// 5a.) Getting data from Flask app
var query_url;

d3.select("#submit").on("click", function() {
  d3.event.preventDefault();
  var year_selected = d3.select("#year").property("value");
  var zip_selected = d3.select("#zip_codes").property("value");
  var ccode_selected = d3.select("#category_code").property("value");
  var bcode_selected = d3.select("#building_code").property("value");
  var basement_selected = d3.select("#basements").property("value");
  var central_air_selected = d3.select("#central_air").property("value");
  var ext_cond_selected = d3.select("#exterior_condition").property("value");
  var garage_selected = d3.select("#garage_spaces").property("value");
  var fireplace_selected = d3.select("#fireplaces").property("value");

  var query_url = `?year=${year_selected}
  &zip_codes=${zip_selected}
  &category_code=${ccode_selected}
  &building_code=${bcode_selected}
  &basements=${basement_selected}
  &central_air=${central_air_selected}
  &exterior_condition=${ext_cond_selected}
  &garage_spaces=${garage_selected}
  &fireplaces=${fireplace_selected}`;

  // 6.) Read in JSON from API route
  const url = `api/v1.0/data${query_url}`
  d3.json(url).then(function(response, err) {
      if (err) throw err;

      // 6a.) Update datatypes to numeric
      console.log(response);
  });
  return query_url;
})
