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

// 2.) Function to calculate average - takes in array of numbers as a parameter
function calculateAverage(numArray) {
    var total = 0;
    for (var i=0; i < numArray.length; i++) {
        total += numArray[i];
    }
    var avg = total / numArray.length;
    return avg
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
    if (err) throw err;

    // 3ci.) Prior to selecting any filters, comp data will not be shown
    // Update upon data being returned - take div with id 'comp-results' and change its class from "hide" to "unhide"
    compResultDiv = d3.select("#comp-results");
    compResultDiv.attr("class","unhide");


    // 3ci.) Create sorted dataset based off of reponse from api/flask call
    sorted_data = response.sort(function(a,b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.sale_date) - new Date(a.sale_date);
    });

    // 3cii.) Grab the top 5 values from the sorted dataset
    var top5values = sorted_data.slice(0,5);

    // 3ciii.) Calculate average sale price of top 5 houses returned - use calculateAverage function defined above
    var salePrices = top5values.map(price => price.sale_price)
    var avgPrice = calculateAverage(salePrices);

    // 3civ.) Define formatting to be used in rendering values from dataset
    var formatComma = d3.format(",");
    var formatDate = d3.timeFormat("%b %d, %Y");

    // 3cv.) Retrieve attributes to be included in comp results
    // Use for loop through and retrieve attributes
    for (var i=0; i < top5values.length; i++) {
        // Retrieve attributes to be injected into comp result html
        var compAddress = `${top5values[i]["location"]}, ${top5values[i]["zip_code"]}`;
        var compSaleDate = formatDate(Date.parse(top5values[i]["sale_date"]));
        var compSalePrice = `$${formatComma(top5values[i]["sale_price"])}`;
        var compTotalRooms = top5values[i]["number_of_rooms"];
        var compBedrooms = top5values[i]["number_of_bedrooms"];
        var compBathrooms = top5values[i]["number_of_bathrooms"];
        var compSquareFootage = `${formatComma(top5values[i]["total_liveable_area"])}`;
        // For age, first get the current day's year
        var currYear = new Date().getFullYear();
        var compAge = currYear - top5values[i]["year_built"]; 
        // Inject html content based on variables defined above
        var currIDValue = `comp-result-${i+1}`;
        // Comp address
        var addressContent = d3.select(`#${currIDValue} h3 span`);
        addressContent.text(compAddress);
        // Comp sale date
        var saleDate = d3.select(`#${currIDValue} .comp-result-sale-date span`);
        saleDate.text(compSaleDate)
        // Comp sale price
        var salePrice = d3.select(`#${currIDValue} .comp-result-sale-price span`);
        salePrice.text(compSalePrice)
        // Comp total rooms
        var totalRooms = d3.select(`#${currIDValue} .comp-result-total-rooms span`);
        totalRooms.text(compTotalRooms)
        // Comp total bedrooms
        var totalBedrooms = d3.select(`#${currIDValue} .comp-result-bedrooms span`);
        totalBedrooms.text(compBedrooms)
        // Comp total bathrooms
        var totalBathrooms = d3.select(`#${currIDValue} .comp-result-bathrooms span`);
        totalBathrooms.text(compBathrooms)
        // Comp square footage
        var squareFootage = d3.select(`#${currIDValue} .comp-result-sq-ft span`);
        squareFootage.text(compSquareFootage)
        // Comp age
        var age = d3.select(`#${currIDValue} .comp-result-age span`);
        age.text(compAge)
    };
    // Update html to display average price based on comp selected
    var avgPriceContent = d3.select("#comp-avg-price h3 span");
    avgPriceContent.text(`$${formatComma(avgPrice)}`);

    // console.log(avgPrice);
    // console.log(salePrices);
    // console.log(sorted_data);
    // console.log(top5values);

    // Disable slickloader
    SlickLoader.disable();

    return top5values;

  });

});
