// 1.) Define svg setup parameters
// Declare variables to be used globally - height and width
var width;
var height;
var chartGroup;

function svgSetup() {
    // Define SVG area dimensions
    var svgWidth = 960;
    var svgHeight = 500;

    // Define the chart's margins as an object
    var margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60
    };

    // 2.) Set width and height of actual graphic based on margins and width/height of svg
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;

    // Select body, append SVG area to it, and set its dimensions
    var svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append a group area, then set its margins
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
};

// 1.) Function to return query string
// 1a.) Declare query_url globally so it can be passed into separate functions
var query_url;

function getQueryString() {
  // Pull values from selection
  var year_selected = d3.select("#year").property("value");
  var zip_selected = d3.select("#zip_codes").property("value");
  var ccode_selected = d3.select("#category_code").property("value");
  var bcode_selected = d3.select("#building_code").property("value");
  var basement_selected = d3.select("#basements").property("value");
  var central_air_selected = d3.select("#central_air").property("value");
  var ext_cond_selected = d3.select("#exterior_condition").property("value");
  var garage_selected = d3.select("#garage_spaces").property("value");
  var fireplace_selected = d3.select("#fireplaces").property("value");

  var query_url = `api/v1.0/data?year=${year_selected}
    &zip_codes=${zip_selected}
    &category_code=${ccode_selected}
    &building_code=${bcode_selected}
    &basements=${basement_selected}
    &central_air=${central_air_selected}
    &exterior_condition=${ext_cond_selected}
    &garage_spaces=${garage_selected}
    &fireplaces=${fireplace_selected}`;

  return query_url;
};

// 3.) Event listener for clicking apply filter button
d3.select("#submit").on("click", function () {

    // Enable slickloader
    SlickLoader.enable();
  
    // 3a.) Prevent default behavior of page refresh upon event trigger
    d3.event.preventDefault();
  
    // 3b.) Create query string based off of selected filters - see getQueryString() function from step 1
    query_string = getQueryString();
  
    // 3c.) Make api call based on query string to return back filtered dataset using d3.json
    d3.json(query_string).then(function (response, err) {

      if(err) throw err;  

      // 3ci.) Extract sale date from response
      var saleDates = response.map(d => new Date(d.sale_date));

      // 3cii.) Extract month from response
      var formatMonth = d3.timeFormat('%b');
      var monthValues = saleDates.map(d => formatMonth(d));

      // 3ciii.) Group data by number of sales by month
      var totalCountByMonth = d3.nest()
        .key(function (d) {return d} )
        .rollup(function (v) {return v.length} )
        .sortKeys(d3.ascending)
        .entries(monthValues);

      // 3civ.) Create plotly traces
      var xAxisValues = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

      function getMonthCount(month) {
        for (i=0; i < totalCountByMonth.length; i++) {
            var currArrayMember = totalCountByMonth[i]
            if (currArrayMember.key === month) {
                return currArrayMember.value;
            }
        };
      };

      // Function to return 0 if undefined 
      function checkUndefined(val) {
          if (typeof val === "undefined") {
              return 0;
          } else {
            return val;
          }
      }

      var yAxisValues = [checkUndefined(getMonthCount("Jan")),
                         checkUndefined(getMonthCount("Feb")),
                         checkUndefined(getMonthCount("Mar")),
                         checkUndefined(getMonthCount("Apr")),
                         checkUndefined(getMonthCount("May")),
                         checkUndefined(getMonthCount("Jun")),
                         checkUndefined(getMonthCount("Jul")),
                         checkUndefined(getMonthCount("Aug")),
                         checkUndefined(getMonthCount("Sep")),
                         checkUndefined(getMonthCount("Oct")),
                         checkUndefined(getMonthCount("Nov")),
                         checkUndefined(getMonthCount("Dec"))];

      var trace1 = {
          x: xAxisValues,
          y: yAxisValues,
          type: 'scatter'
      }

      var data = [trace1];

      var layout = {
        title:'Total Home Sales by Month',
        width: 700,
        height: 575
      };

      Plotly.newPlot('line-chart', data, layout);
      
      // Disable slickloader
      SlickLoader.disable();

  
    });
  
  });