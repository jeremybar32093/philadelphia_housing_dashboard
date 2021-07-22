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

  // 2a.) Create query string based off of selected filters - see getQueryString() function from step 1
  query_string = getQueryString();

  // 2b.) Make api call based on query string to return back filtered dataset using d3.json
  d3.json(query_string).then(function (response, err) {
    
    console.log(response);

    // 2bi.) Display total number of home sales - calculate by simply taking the length of the response array  (# of records)
    var totalHomeCount = d3.select("#total-home-count span");
    totalHomeCount.text(response.length)

    // 2bii.) Get array of prices only to calculate summary statistics
    var prices = response.map(price => price.sale_price);
    // Calculte summary statistics using d3 and render html
    mean_price = d3.mean(prices);
    var meanPriceHTML = d3.select("#summary-stats-price #summary-stat-mean span");
    meanPriceHTML.text(mean_price);

    median_price = d3.median(prices);
    var medianPriceHTML = d3.select("#summary-stats-price #summary-stat-median span");
    medianPriceHTML.text(median_price);

    stdev_price = d3.deviation(prices);
    var stdevPriceHTML = d3.select("#summary-stats-price #summary-stat-stdev span");
    stdevPriceHTML.text(stdev_price);

    min_price = d3.min(prices);
    var minPriceHTML = d3.select("#summary-stats-price #summary-stat-min span");
    minPriceHTML.text(min_price);

    max_price = d3.max(prices); 
    var maxPriceHTML = d3.select("#summary-stats-price #summary-stat-max span");
    maxPriceHTML.text(min_price);
    
    // 2biii.) Create pie chart of distribution of age of homes sold
    
    // 2biv.) Calculate total amounts exchanged
    total_dollars = d3.sum(prices);
    totalDollarsHTML = d3.select("#total-dollars-exchanged span")
    totalDollarsHTML.text(total_dollars);

    //2bv.) Calculate bar chart showing interior/exterior condition

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
    topZip1Count.text(top5zip[0]["value"]);
    var topZip2Count = d3.select("#top-zip-2 .column-2")
    topZip2Count.text(top5zip[1]["value"]);
    var topZip3Count = d3.select("#top-zip-3 .column-2")
    topZip3Count.text(top5zip[2]["value"]);
    var topZip4Count = d3.select("#top-zip-4 .column-2")
    topZip4Count.text(top5zip[3]["value"]);
    var topZip5Count = d3.select("#top-zip-5 .column-2")
    topZip5Count.text(top5zip[4]["value"]);

    console.log(totalCountByZip);
    console.log(top5zip);

  });
};

handleClick();

//     if (err) throw err;

//     // 3ci.) Prior to selecting any filters, comp data will not be shown
//     // Update upon data being returned - take div with id 'comp-results' and change its class from "hide" to "unhide"
//     compResultDiv = d3.select("#comp-results");
//     compResultDiv.attr("class", "unhide");

//     // 3ci.) Create sorted dataset based off of reponse from api/flask call
//     sorted_data = response.sort(function (a, b) {
//       // Turn your strings into dates, and then subtract them
//       // to get a value that is either negative, positive, or zero.
//       return new Date(b.sale_date) - new Date(a.sale_date);
//     });

//     // 3cii.) Grab the top 5 values from the sorted dataset
//     var top5values = sorted_data.slice(0, 5);

//     // 3ciii.) Calculate average sale price of top 5 houses returned - use calculateAverage function defined above
//     var salePrices = top5values.map((price) => price.sale_price);
//     var avgPrice = calculateAverage(salePrices);

//     // 3civ.) Define formatting to be used in rendering values from dataset
//     var formatComma = d3.format(",");
//     var formatDate = d3.timeFormat("%b %d, %Y");

//     // 3cv.) Retrieve attributes to be included in comp results
//     // Use for loop through and retrieve attributes
//     for (var i = 0; i < top5values.length; i++) {
//         // Retrieve year attribute to be passed
//     //   // Retrieve attributes to be injected into comp result html
//     //   var compAddress = `${top5values[i]["location"]}, ${top5values[i]["zip_code"]}`;
//     //   var compSaleDate = formatDate(Date.parse(top5values[i]["sale_date"]));
//     //   var compSalePrice = `$${formatComma(top5values[i]["sale_price"])}`;
//     //   var compTotalRooms = top5values[i]["number_of_rooms"];
//     //   var compBedrooms = top5values[i]["number_of_bedrooms"];
//     //   var compBathrooms = top5values[i]["number_of_bathrooms"];
//     //   var compSquareFootage = `${formatComma(
//     //     top5values[i]["total_liveable_area"]
//     //   )}`;
//     //   // For age, first get the current day's year
//     //   var currYear = new Date().getFullYear();
//     //   var compAge = currYear - top5values[i]["year_built"];
//     //   // Inject html content based on variables defined above
//     //   var currIDValue = `comp-result-${i + 1}`;
//     //   // Comp address
//     //   var addressContent = d3.select(`#${currIDValue} h3 span`);
//     //   addressContent.text(compAddress);
//     //   // Comp sale date
//     //   var saleDate = d3.select(`#${currIDValue} .comp-result-sale-date span`);
//     //   saleDate.text(compSaleDate);
//     //   // Comp sale price
//     //   var salePrice = d3.select(`#${currIDValue} .comp-result-sale-price span`);
//     //   salePrice.text(compSalePrice);
//     //   // Comp total rooms
//     //   var totalRooms = d3.select(
//     //     `#${currIDValue} .comp-result-total-rooms span`
//     //   );
//     //   totalRooms.text(compTotalRooms);
//     //   // Comp total bedrooms
//     //   var totalBedrooms = d3.select(
//     //     `#${currIDValue} .comp-result-bedrooms span`
//     //   );
//     //   totalBedrooms.text(compBedrooms);
//     //   // Comp total bathrooms
//     //   var totalBathrooms = d3.select(
//     //     `#${currIDValue} .comp-result-bathrooms span`
//     //   );
//     //   totalBathrooms.text(compBathrooms);
//     //   // Comp square footage
//     //   var squareFootage = d3.select(`#${currIDValue} .comp-result-sq-ft span`);
//     //   squareFootage.text(compSquareFootage);
//     //   // Comp age
//     //   var age = d3.select(`#${currIDValue} .comp-result-age span`);
//     //   age.text(compAge);
//     // }
//     // // Update html to display average price based on comp selected
//     // var avgPriceContent = d3.select("#comp-avg-price h3 span");
//     // avgPriceContent.text(`$${formatComma(avgPrice)}`);

//     // console.log(avgPrice);
//     // console.log(salePrices);
//     // console.log(sorted_data);
//     // console.log(top5values);
//     // return top5values;
//   });

