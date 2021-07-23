function makeResponsive() {

  // 1.) Set SVG width, height, and margins
  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  };

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  svgWidth = window.innerWidth;
  svgHeight = window.innerHeight;
  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100,
  };

  // 2.) Set width and height of actual graphic based on margins and width/height of svg
  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

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
  var chosenXAxis = "sale_price";
  var chosenYAxis = "market_value";

  // 5a.) Getting data from Flask app
  var query_url;
  d3.select("#submit").on("click", function () {
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

    queryData(query_url);
    return query_url;
  })

  // The code for the chart is wrapped inside a function that
  // automatically resizes the chart
  // 6.) Read in JSON from API route
  function queryData(query_url) {
    const url = `api/v1.0/data${query_url}`
    d3.json(url).then(function (response, err) {
      if (err) throw err;

      // 6a.) Update datatypes to numeric
      console.log(response);
      plotting(response);

    })
  }

  // Clear the data from the previous graph
  function clearPlot() {
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove();
    svg.selectAll("g.tick").remove();
  };

  // Scale the x values for the axis
  function xScaling(data) {
    var xScale = d3.scaleLinear()
      .domain([d3.min(data, (d) => d[chosenXAxis]), d3.max(data, (d, i) => d[chosenXAxis])])
      .range([0, chartWidth]);
    return xScale;
  }

  // Scale the y values for the axis
  function yScaling(data) {
    var yScale = d3.scaleLinear()
      .domain([d3.min(data, (d, i) => d[chosenYAxis]), d3.max(data, (d, i) => d[chosenYAxis])])
      .range([chartHeight, 0]);
    return yScale;
  };

  // Plotting function
  function plotting(response) {
    response.forEach(function (d, i) {

      // Clear previous data points
      clearPlot();

      // Parse data
      var formatDate = d3.timeFormat("%b %d, %Y");
      var saleDates = formatDate(Date.parse(response[i].sale_date));
      response[i].sale_price = +response[i].sale_price;
      response[i].market_value = +response[i].market_value;

      // Scale x and y data
      var xScale = xScaling(response);
      var yScale = yScaling(response);

      // Assign and format Axis
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      // Append axis to svg
      chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
      chartGroup.append("g")
        .call(yAxis);

      // Format Axis Labels
      chartGroup.append("text")
        .attr("text-anchor", "end")
        .attr("x", (chartWidth / 2))
        .attr("y", chartHeight + 40)
        .text("Sale Price ($)");

      chartGroup.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - margin.left + 20)
        .text("Market Value ($)");

      // Format scatter plot points
      var circleGroup = chartGroup.selectAll("circle")
        .data(response);

      var elemEnter = circleGroup.enter();

      // Create circles for data points
      var circle = elemEnter.append("circle")
        .attr("cx", d => xScale(d[chosenXAxis]))
        .attr("cy", d => yScale(d[chosenYAxis]))
        .attr("r", "5")
        .classed("dataCircle", true);

      // Create text for state abbreviations inside circles
      var circleText = elemEnter.append("text")
        .attr("x", d => xScale(d[chosenXAxis]))
        .attr("y", d => yScale(d[chosenYAxis]) + 5)
        .classed("dataText", true);

      var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([120, -60])
        .html(d => `<strong>Location: </strong>${d.location}<br><strong>Sale Date: </strong>${saleDates}<hr>Sale Price: $${d[chosenXAxis]}<br>Market Value: $${d[chosenYAxis]}`);

      circle.call(toolTip);
      circle.on("mouseover", function (d) {
        toolTip.show(d, this)
      })

        .on("mouseout", function (d) {
          toolTip.hide(d);
        })
      circleText.on("mouseover", function (d) {
        toolTip.show(d, this);
      })
        .on("mouseout", function (d) {
          toolTip.hide(d);
        })
    })
  }
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);