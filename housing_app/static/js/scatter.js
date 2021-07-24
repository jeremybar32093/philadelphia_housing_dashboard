
// Create function to set up initial SVG prior to populating with data
// Declare variables to be used globally - height and width
var width;
var height;
var chartGroup;
var chosenXAxis;
var chosenYAxis;

function svgSetup() {
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
  width = svgWidth - margin.left - margin.right;
  height = svgHeight - margin.top - margin.bottom;

  // 3.) Create an SVG wrapper, append an SVG group that will hold our chart,
  //     and shift the latter by left and top margins.
  //     SVG will go within div that has class "scatter"
  var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // 4.) Append an SVG group and translate based on margins defined above
  chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`); 

  // 5.) Set initial parameters to be used for x and y axes  
  chosenXAxis = "total_liveable_area";
  chosenYAxis = "sale_price";
}



// 6.) Create function used for updating x-scale based on either chosen default or selection from screen
function xScale(housingData, chosenXAxis) {
  // 6a.) create x scale
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(housingData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(housingData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
};

// 7.) Create function used for updating y-scale based on either chosen default or selection from screen
function yScale(housingData, chosenYAxis) {
  // 7a.) create y scale
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(housingData, (d) => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// 8.) Function to re-render x axis after selecting a new variable (see event listener below)
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// 9.) Function to re-render y axis after selecting a new variable (see event listender below)
function renderYAxis(newYScale, yAxis) {

  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

// 10.) Function to update circle positions based on new chosen x-axis
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  // 10a.) Update x location of circles themselves
  circlesGroup
    .transition()
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .duration(1000);

  return circlesGroup;
}

// 11.) Function to update circle positions based on new chosen y-axis
function renderCirclesYAxis(circlesGroup, newYScale, chosenYAxis) {
  // 11a.) Update y location of circles themselves
  circlesGroup
    .transition()
    .attr("cy", (d) => newYScale(d[chosenYAxis]))
    .selectAll("text")
    .attr("dy", (d) => newYScale(d[chosenYAxis]))
    .duration(1000);

  return circlesGroup;
}

// 12.) Declare function used for updating circles group with new tooltip
//      Read in both chosen X and Y axes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // 12a.) Create tooltip
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function (d) {

      var locationString = `Location: ${d["location"]}<br>`;
      var yAxisString = `Sale Price: $${d[chosenYAxis]}<br>`;
      var xAxisString = `${chosenXAxis}: ${d[chosenXAxis]}`;
      var tooltip_html_string = `${locationString} ${yAxisString} ${xAxisString}`;
      return tooltip_html_string;

    });

  // 12b.) Attach tooltip to circlesGroup
  circlesGroup.call(toolTip);

  // 12c.) Event listeners for hovering over datapoint
  // Show relevant data when user hovers over datapoint
  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    // hide tooltip on onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// 13.) Function to return query string
// 13a.) Declare query_url globally so it can be passed into separate functions
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

// 14.) Event listener for clicking apply filter button
d3.select("#submit").on("click", function() {

    // Enable slickloader
    SlickLoader.enable();

    // clear svg if not empty and reset
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
      svgArea.remove();
    };

    svgSetup();
    


    // 14a.) Prevent default behavior of page refresh upon event trigger
    d3.event.preventDefault();
  
    // 14b.) Create query string based off of selected filters - see getQueryString() function from step 1
    query_string = getQueryString();

    // 14c.) Make api call based on query string to return back filtered dataset using d3.json
    d3.json(query_string).then(function(response, err) {
      if(err) throw err;

      // 14a.) Update datatypes to numeric
      response.forEach(function (data) {
        data.depth = +data.depth;
        data.exempt_building = +data.exempt_building;
        data.exempt_land = +data.exempt_land;
        data.fireplaces = +data.fireplaces;
        data.frontage = +data.frontage;
        data.garage_spaces = +data.garage_spaces;
        data.market_value = +data.market_value;
        data.number_of_bathrooms = +data.number_of_bathrooms;
        data.number_of_bedrooms = +data.number_of_bedrooms;
        data.number_of_rooms = +data.number_of_rooms;
        data.number_stories = +data.number_stories;
        data.sale_price = +data.sale_price;
        data.taxable_building = +data.taxable_building;
        data.taxable_land = +data.taxable_land;
        data.total_area = +data.total_area;
        data.total_liveable_area = +data.total_liveable_area;
      });

      // 14b.) Set x and y-axis scale of specific dataset using xScale and yScale functions defined above in steps 6/7
      var xLinearScale = xScale(response, chosenXAxis);
      var yLinearScale = yScale(response, chosenYAxis);

      // 14c.) Create axes on graph object
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // 14d.) Append x and y axis to chart group defined above in step 4
      // x-axis
      var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
      // y axis
      var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

      // 14e.) Append initial set of circles in scatter plot
      var circlesGroup = chartGroup
      .selectAll("circle")
      .data(response)
      .enter();

    circlesGroup
      .append("circle")
      .classed("housingCircle", true)
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("r", 5);

      // 14f.) Logic to add tooltip - for some reason, had to recreate/rebind circlesGroup for it to work properly
      var circlesGroup = chartGroup.selectAll("circle").data(response);
      updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // 14g.) Add axis labels
      // x axis label - have dynamic dropdown selection
      var scatterArea = d3.select(".scatter-area");
      var selectData = [ {"text": "Square Feet", "value": "total_liveable_area"},
                         {"text": "Depth", "value": "depth"},
                         {"text": "Exempt Building", "value": "exempt_building"},
                         {"text": "Exempt Land", "value": "exempt_land"},
                         {"text": "Fireplaces", "value": "fireplaces"},
                         {"text": "Frontage", "value": "frontage"},
                         {"text": "Garage Spaces", "value": "garage_spaces"},
                         {"text": "Market Value", "value": "market_value"},
                         {"text": "Number of Bathrooms", "value": "number_of_bathrooms"},
                         {"text": "Number of Bedrooms", "value": "number_of_bedrooms"},
                         {"text": "Number of Rooms", "value": "number_of_rooms"},
                         {"text": "Number of Stories", "value": "number_stories"},
                         {"text": "Taxable Building", "value": "taxable_building"},
                         {"text": "Taxable Land", "value": "taxable_land"}
                         
                      ];
      // clear selector label and reset if not empty
      var spanLabel = d3.select("#span-label");
      if (!spanLabel.empty()) {
        spanLabel.remove();
      };
      var xAxisSelector = d3.select("#x-axis-selection")
      if (!xAxisSelector.empty()) {
        xAxisSelector.remove();
      };
      var span = scatterArea.append("span")
                            .attr("id","span-label")
                            .text("Select X Axis Variable: ");
      var xInput = scatterArea.append("select")
                              .attr("id","x-axis-selection")
                              .selectAll("option")
                              .data(selectData)
                              .enter()
                              .append("option")
                              .attr("value",function (d) { return d.value })
                              .text(function (d) {return d.text});

      var labelsGroup = chartGroup
                        .append("g")
                        .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
      // append y axis label
      // Redeclare margin to work around error 
      var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100,
      };

      var yLabelsGroup = chartGroup.append("g");

      var yAxisLabel = yLabelsGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .attr("value", "sale_price")
        .classed("aText y-axis-label", true)
        .text("Sale Price");

      // On change event listener for x-axis selection
      d3.select("#x-axis-selection").on("change", function() {
        console.log("x axis selection changed")
        var value = d3.select("#x-axis-selection").property("value");
        console.log(value);
        if (value !== chosenXAxis) {
          chosenXAxis = value;
          xLinearScale = xScale(response, chosenXAxis);
          xAxis = renderXAxis(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
          updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);  
        };
      });

      // Disable slickloader
      SlickLoader.disable();
    });
});


//---------------------------------------------------------------------------------------------------
// function makeResponsive() {

//   // 1.) Set SVG width, height, and margins
//   // if the SVG area isn't empty when the browser loads,
//   // remove it and replace it with a resized version of the chart
//   var svgArea = d3.select("body").select("svg");

//   // clear svg is not empty
//   if (!svgArea.empty()) {
//     svgArea.remove();
//   };

//   // SVG wrapper dimensions are determined by the current width and
//   // height of the browser window.
//   svgWidth = window.innerWidth;
//   svgHeight = window.innerHeight;
//   var margin = {
//     top: 20,
//     right: 40,
//     bottom: 80,
//     left: 100,
//   };

//   // 2.) Set width and height of actual graphic based on margins and width/height of svg
//   var chartWidth = svgWidth - margin.left - margin.right;
//   var chartHeight = svgHeight - margin.top - margin.bottom;

//   // 3.) Create an SVG wrapper, append an SVG group that will hold our chart,
//   //     and shift the latter by left and top margins.
//   //     SVG will go within div that has class "scatter"
//   var svg = d3
//     .select("#scatter")
//     .append("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight);

//   // 4.) Append an SVG group and translate based on margins defined above
//   var chartGroup = svg
//     .append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);

//   // 5.) Set initial parameters to be used for x and y axes
//   var chosenXAxis = "market_value";
//   var chosenYAxis = "sale_price";

//   // 5a.) Getting data from Flask app
//   var query_url;
//   d3.select("#submit").on("click", function () {
//     d3.event.preventDefault();
//     var year_selected = d3.select("#year").property("value");
//     var zip_selected = d3.select("#zip_codes").property("value");
//     var ccode_selected = d3.select("#category_code").property("value");
//     var bcode_selected = d3.select("#building_code").property("value");
//     var basement_selected = d3.select("#basements").property("value");
//     var central_air_selected = d3.select("#central_air").property("value");
//     var ext_cond_selected = d3.select("#exterior_condition").property("value");
//     var garage_selected = d3.select("#garage_spaces").property("value");
//     var fireplace_selected = d3.select("#fireplaces").property("value");

//     var query_url = `?year=${year_selected}
//     &zip_codes=${zip_selected}
//     &category_code=${ccode_selected}
//     &building_code=${bcode_selected}
//     &basements=${basement_selected}
//     &central_air=${central_air_selected}
//     &exterior_condition=${ext_cond_selected}
//     &garage_spaces=${garage_selected}
//     &fireplaces=${fireplace_selected}`;

//     queryData(query_url);
//     return query_url;
//   })

//   // The code for the chart is wrapped inside a function that
//   // automatically resizes the chart
//   // 6.) Read in JSON from API route
//   function queryData(query_url) {
//     const url = `api/v1.0/data${query_url}`
//     d3.json(url).then(function (response, err) {
//       if (err) throw err;

//       // 6a.) Update datatypes to numeric
//       console.log(response);
//       plotting(response);

//     })
//   }

//   // Clear the data from the previous graph
//   function clearPlot() {
//     svg.selectAll("circle").remove();
//     svg.selectAll("text").remove();
//     svg.selectAll("g.tick").remove();
//   };

//   // Scale the x values for the axis
//   function xScaling(data) {
//     var xScale = d3.scaleLinear()
//       .domain([d3.min(data, (d) => d[chosenXAxis]), d3.max(data, (d, i) => d[chosenXAxis])])
//       .range([0, chartWidth]);
//     return xScale;
//   }

//   // Scale the y values for the axis
//   function yScaling(data) {
//     var yScale = d3.scaleLinear()
//       .domain([d3.min(data, (d, i) => d[chosenYAxis]), d3.max(data, (d, i) => d[chosenYAxis])])
//       .range([chartHeight, 0]);
//     return yScale;
//   };

//   // Plotting function
//   function plotting(response) {
//     response.forEach(function (d, i) {

//       // Clear previous data points
//       clearPlot();

//       // Parse data
//       var formatDate = d3.timeFormat("%b %d, %Y");
//       var saleDates = formatDate(Date.parse(response[i].sale_date));
//       response[i].sale_price = +response[i].sale_price;
//       response[i].market_value = +response[i].market_value;

//       // Scale x and y data
//       var xScale = xScaling(response);
//       var yScale = yScaling(response);

//       // Assign and format Axis
//       var xAxis = d3.axisBottom(xScale);
//       var yAxis = d3.axisLeft(yScale);

//       // Append axis to svg
//       chartGroup.append("g")
//         .attr("transform", `translate(0, ${chartHeight})`)
//         .call(xAxis);
//       chartGroup.append("g")
//         .call(yAxis);

//       // Format Axis Labels
//       chartGroup.append("text")
//         .attr("text-anchor", "end")
//         .attr("x", (chartWidth / 2))
//         .attr("y", chartHeight + 40)
//         .text("Sale Price ($)");

//       chartGroup.append("text")
//         .attr("text-anchor", "end")
//         .attr("transform", "rotate(-90)")
//         .attr("x", 0 - (chartHeight / 2))
//         .attr("y", 0 - margin.left + 20)
//         .text("Market Value ($)");

//       // Format scatter plot points
//       var circleGroup = chartGroup.selectAll("circle")
//         .data(response);

//       var elemEnter = circleGroup.enter();

//       // Create circles for data points
//       var circle = elemEnter.append("circle")
//         .attr("cx", d => xScale(d[chosenXAxis]))
//         .attr("cy", d => yScale(d[chosenYAxis]))
//         .attr("r", "5")
//         .classed("dataCircle", true);

//       // Create text for state abbreviations inside circles
//       var circleText = elemEnter.append("text")
//         .attr("x", d => xScale(d[chosenXAxis]))
//         .attr("y", d => yScale(d[chosenYAxis]) + 5)
//         .classed("dataText", true);

//       var toolTip = d3.tip()
//         .attr("class", "d3-tip")
//         .offset([120, -60])
//         .html(d => `<strong>Location: </strong>${d.location}<br><strong>Sale Date: </strong>${saleDates}<hr>Sale Price: $${d[chosenXAxis]}<br>Market Value: $${d[chosenYAxis]}`);

//       circle.call(toolTip);
//       circle.on("mouseover", function (d) {
//         toolTip.show(d, this)
//       })

//         .on("mouseout", function (d) {
//           toolTip.hide(d);
//         })
//       circleText.on("mouseover", function (d) {
//         toolTip.show(d, this);
//       })
//         .on("mouseout", function (d) {
//           toolTip.hide(d);
//         })
//     })
//   }
// }

// // When the browser loads, makeResponsive() is called.
// // makeResponsive();

// // When the browser window is resized, makeResponsive() is called.
// d3.select(window).on("resize", makeResponsive);