// 1.) Function to return query string
// 1a.) Declare query_url globally so it can be passed into separate functions
var query_url;

function getQueryString() {
  // Pull values from selection
  var year_selected = d3.select("#year").property("value");
  // Since on this page there are no other filtering parameters, hardcode to 'no_selection' so that api query string still works
  var zip_selected = 'no_selection';
  var ccode_selected = 'no_selection';
  var bcode_selected = 'no_selection';
  var basement_selected = 'no_selection';
  var central_air_selected = 'no_selection';
  var ext_cond_selected = 'no_selection';
  var garage_selected = 'no_selection';
  var fireplace_selected = 'no_selection';

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
}

// 2.) Define function to execute to refresh data in dashboard items
function handleClick() {

  // Enable slickloader
  SlickLoader.enable();

  // 2a.) Create query string based off of selected filters - see getQueryString() function from step 1
  query_string = getQueryString();

  // 2b.) Make api call based on query string to return back filtered dataset using d3.json
  d3.json(query_string).then(function (response, err) {
    
    console.log(response);

    // Declare formatting to be used in final number format outputs
    var formatComma = d3.format(",");

    // -------------------------------------------------------------------------------------------
    // 2bi.) Display total number of home sales - calculate by simply taking the length of the response array  (# of records)

    var totalHomeCount = d3.select("#total-home-count span");
    totalHomeCount.text(formatComma(response.length));
    // -------------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------------
    // 2bii.) Get array of prices only to calculate summary statistics
    var prices = response.map(price => price.sale_price);
    // Calculte summary statistics using d3 and render html
    mean_price = d3.mean(prices);
    var meanPriceHTML = d3.select("#summary-stats-price #summary-stat-mean span");
    meanPriceHTML.text(`$${formatComma(Math.round(mean_price))}`);

    median_price = d3.median(prices);
    var medianPriceHTML = d3.select("#summary-stats-price #summary-stat-median span");
    medianPriceHTML.text(`$${formatComma(Math.round(median_price))}`);

    stdev_price = d3.deviation(prices);
    var stdevPriceHTML = d3.select("#summary-stats-price #summary-stat-stdev span");
    stdevPriceHTML.text(`$${formatComma(Math.round(stdev_price))}`);

    min_price = d3.min(prices);
    var minPriceHTML = d3.select("#summary-stats-price #summary-stat-min span");
    minPriceHTML.text(`$${formatComma(Math.round(min_price))}`);

    max_price = d3.max(prices); 
    var maxPriceHTML = d3.select("#summary-stats-price #summary-stat-max span");
    maxPriceHTML.text(`$${formatComma(Math.round(max_price))}`);
    // -------------------------------------------------------------------------------------------
    
    // -------------------------------------------------------------------------------------------
    // 2biii.) Create pie chart of distribution of age of homes sold
    // Calculate the age and send into its own array
    var currYear = new Date().getFullYear();
    var ageArray = response.map(age => currYear - age.year_built);
    // Loop through the age array, create new array with age bucket
    var ageArrayBuckets = ageArray.map(function (age) {
                                          if (age >= 100) { return "100+"} 
                                          else if (age < 100 && age >= 90) { return "90 - 100"}
                                          else if (age < 90 && age >= 80) {return "80 - 90"}
                                          else if (age < 80 && age >= 70) {return "70 - 80"}
                                          else if (age < 70 && age >= 60) {return "60 - 70"}
                                          else if (age < 60 && age >= 50) {return "50 - 60"}
                                          else if (age < 50 && age >= 40) {return "40 - 50"}
                                          else if (age < 40 && age >= 30) {return "30 - 40"}
                                          else if (age < 30 && age >= 20) {return "20 - 30"}
                                          else if (age < 20 && age >= 10) {return "10 - 20"}
                                          else if (age < 10 && age >= 0) {return "0 - 10"}
                                        }                                                
                                        );
    // Then do group by similar to what was done for top 5 zips/bar chart
    var totalCountByAgeBucket = d3.nest()
                                  .key(function (d) {return d} )
                                  .rollup(function (v) {return v.length} )
                                  .entries(ageArrayBuckets);

    var data = [{
        values: totalCountByAgeBucket.map(val => val.value),
        labels: totalCountByAgeBucket.map(label => label.key),
        type: 'pie'
    }];

    var layout = {
      title: "Total Home Sales by Age",
      height: 400,
      width: 400
    };
    
    Plotly.newPlot('pie-chart', data, layout);
    // -------------------------------------------------------------------------------------------
    
    // -------------------------------------------------------------------------------------------
    // 2biv.) Calculate total amounts exchanged
    total_dollars = d3.sum(prices);
    totalDollarsHTML = d3.select("#total-dollars-exchanged span")
    totalDollarsHTML.text(`$${(total_dollars / 1000000000).toFixed(2)}B`);
    // -------------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------------
    //2bv.) Calculate bar chart showing interior/exterior condition
    var totalCountByIntCondition = d3.nest()
                                     .key(function (d) { return d.interior_condition} )
                                     .rollup(function (v) {return v.length} )
                                     .entries(response);
    
    var totalCountByExtCondition = d3.nest()
                                     .key(function (d) {return d.exterior_condition} )
                                     .rollup(function (v) {return v.length} )
                                     .entries(response);
    // Create plotly chart based on totalCountByIntCondition/totalCountByExtCondition defined above
    var intConditionXTrace = totalCountByIntCondition.map(valx => valx.key )
    var intConditionYTrace = totalCountByIntCondition.map(valy => valy.value)

    var trace1 = {
      x: intConditionXTrace,
      y: intConditionYTrace,
      name: "Interior Condition",
      type: "bar"
    }

    var extConditionXTrace = totalCountByExtCondition.map(valx => valx.key )
    var extConditionYTrace = totalCountByExtCondition.map(valy => valy.value)

    var trace2 = {
      x: extConditionXTrace,
      y: extConditionYTrace,
      name: "Exterior Condition",
      type: "bar"
    }

    var data = [trace1, trace2];
    var layout = {
      title: "Number of Sales by Home Condition",
      barmode: 'group',
      legend: {"orientation": "h"},
      width: 500,
      height: 400
    };
    Plotly.newPlot('bar-chart', data, layout);
    // -------------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------------
    //2bvi.) Calculate top 5 zip codes by # of homes sold
    // NOTE: use d3.nest, adapted from http://learnjsdata.com/group_data.html
    var totalCountByZip = d3.nest()
                            .key(function (d) { return d.zip_code} )
                            .rollup(function (v) { return v.length })
                            .entries(response);
    var sortedCountByZip = totalCountByZip.sort(function(a,b) {
        return b.value - a.value
    });
    var top5zip = sortedCountByZip.slice(0,5)

    // After deriving the top 5 zip codes, populate into table
    // Zip code values
    var topZip1Value = d3.select("#top-zip-1 .column-1")
    topZip1Value.text(top5zip[0]["key"]);
    var topZip2Value = d3.select("#top-zip-2 .column-1")
    topZip2Value.text(top5zip[1]["key"]);
    var topZip3Value = d3.select("#top-zip-3 .column-1")
    topZip3Value.text(top5zip[2]["key"]);
    var topZip4Value = d3.select("#top-zip-4 .column-1")
    topZip4Value.text(top5zip[3]["key"]);
    var topZip5Value = d3.select("#top-zip-5 .column-1")
    topZip5Value.text(top5zip[4]["key"]);
    // Zip code counts
    var topZip1Count = d3.select("#top-zip-1 .column-2")
    topZip1Count.text(formatComma(top5zip[0]["value"]));
    var topZip2Count = d3.select("#top-zip-2 .column-2")
    topZip2Count.text(formatComma(top5zip[1]["value"]));
    var topZip3Count = d3.select("#top-zip-3 .column-2")
    topZip3Count.text(formatComma(top5zip[2]["value"]));
    var topZip4Count = d3.select("#top-zip-4 .column-2")
    topZip4Count.text(formatComma(top5zip[3]["value"]));
    var topZip5Count = d3.select("#top-zip-5 .column-2")
    topZip5Count.text(formatComma(top5zip[4]["value"]));
    // -------------------------------------------------------------------------------------------
    // Disable slickloader
    SlickLoader.disable();
  });
};

// 3.) Add event listener for on change event of changing year prompt
d3.select("#year").on("change", function() {
  console.log("year prompt changed")
  handleClick();
});

handleClick();

