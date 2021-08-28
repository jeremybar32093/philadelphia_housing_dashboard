// -----------------------------------
// 1.) HELPER FUNCTION DEFINITIONS

// ----------

// 1a.) Define function to geocode address
function getCoordsFromAddress(address) {
  var geocodeAPIBaseURL = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  var encodedAddress = encodeURIComponent(address);
  var apiCallLink = `${geocodeAPIBaseURL}${encodedAddress}.json?access_token=${API_KEY}`;
  // Perform API call using D3
  let result = d3.json(apiCallLink).then(function(response) {
    var coordinateResult = response.features[0].center;
    return coordinateResult;
  });
  return result;
}

// END: Define function to geocode address
// ----------

// ----------
// 1b.) Define function to create query string to ultimately use in comps valuation

function getCompsQueryString() {
  // Pull values from property feature selections
  var zip_selected = d3.select("#zip").property("value");
  var bedrooms_selected = d3.select("#number_bedrooms").property("value");
  var bathrooms_selected = d3.select("#number_bathrooms").property("value");
  var square_footage_selected = d3.select("#square_feet").property("value");
  var parking_spaces_selected = d3.select("#parking_spaces").property("value");

  var comps_query_url = `api/v1.0/data/comps?zip=${zip_selected}&number_bedrooms=${bedrooms_selected}&number_bathrooms=${bathrooms_selected}&square_footage=${square_footage_selected}&parking_spaces=${parking_spaces_selected}`;
  
  return comps_query_url;
}

// END: function to create query string to ultimately use in comps valuation
// ----------

// ----------
// 1c.) Define function to pull back comps dataset based on query string
function getCompsData(queryURL) {
  var compsData = d3.json(queryURL).then(function (response) {
    return response;
  });
  return compsData;
}
// ----------

// ----------
// 1d.) Functions to calculate distance between 2 coordinate points
// Code taken from: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// ----------

// ----------
// 1e.) Function to calculate principal and interest payment
function calcMonthlyPayment(price, downPayment, interestRate, mortgageLength) {
  
  var mortgageAmount = price - downPayment;
  var monthlyRate = interestRate / 12;
  var totalPayments = mortgageLength * 12;

  var numerator = monthlyRate * Math.pow((1 + monthlyRate),totalPayments);
  var denominator = Math.pow((1 + monthlyRate), totalPayments) - 1;
  var monthlyPayment = mortgageAmount * (numerator / denominator);

  return monthlyPayment;

}

// ----------
// END: Function to calculate principal and interest payment

// ----------
// 1f.) Function to pull regression model coefficients from database

function getRegressionCoefficients() {
  var query_url = '/api/v1.0/data/coefficients'
  var regressionCoefficients = d3.json(query_url).then(function (response) {
    return response;
  })
  return regressionCoefficients;
}

// END: Function to pull regression model coefficients from database
// ----------

// ----------
// 1g.) Function to pull regression model r^2 value from database
function getRegressionRSquared () {
  var query_url = '/api/v1.0/data/rsquared';
  var regressionRSquared = d3.json(query_url).then(function (response) {
    return response;
  })
  return regressionRSquared;
}

// END: Function to pull regression model r^2 value from database
// ----------

// END: HELPER FUNCTION DEFINITIONS
// -----------------------------------


// -----------------------------------
// 2.) CODE TO EXECUTE ON PAGE STARTUP

// ----------
// 2a.) Create base map

// Creating map object
var myMap = L.map("map", {
  center: [39.9526, -75.1652],
  zoom: 12
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
tileSize: 512,
maxZoom: 18,
zoomOffset: -1,
id: "mapbox/streets-v11",
accessToken: API_KEY
}).addTo(myMap);

// END: Create base map 
// ----------

// END: CODE TO EXECUTE ON STARTUP
// -----------------------------------

// -----------------------------------
// 3.) CODE TO EXECUTE UPON CALCULATING ANALYSIS

// ----------
// 3a.) Function to perform all operations related to computing comps analysis

function computeCompsAnalysis() {

    // SlickLoader.enable();

    // d3.event.preventDefault();
  
    // Retrieve parameters entered in property address section
    var streetAddress = d3.select("#address").property("value");
    var streetAddress2 = d3.select("#address2").property("value");
    var city = d3.select("#city").property("value");
    var state = d3.select("#state").property("value");
    var zipCode = d3.select("#zip").property("value");

    // Build address value to pass into mapbox API
    var selectedAddressLine = `"${streetAddress} ${streetAddress2} ${city} ${state} ${zipCode}"`;

    // Create JSON promises for geocode for selected address line, as well as comps data from database based off of entered property features
    var geocodePromise = getCoordsFromAddress(selectedAddressLine);
    var compsQueryString = getCompsQueryString();
    var compsDataPromise = getCompsData(compsQueryString);


    // ***** To calculate distances, declare empty array variable outside of promise
    // If you push results into that variable, likely can use it after promise 
    // Otherwise, can geocode addresses in the back end sql table *****

    // ---------------------------------------------------------
    // Test Code
    // Declare empty array to feed compsDataResult into as well as sorted data by distnace
    var compsDataArray = [];
    var sorted_data_distance = [];
    // ---------------------------------------------------------

    // Use promise.all to return both promises, allowing for ability to work with both data results
    // (promise for selected target address, and promise for returned comparables data)
    Promise.all([geocodePromise, compsDataPromise]).then(values => {
      
      var geocodePromiseResult = values[0];
      var compsDataPromiseResult = values[1];  
    
      compsDataArray.push(...compsDataPromiseResult);
      
      // Extract longitude/latitude from selected address
      var latitude = geocodePromiseResult[1];
      var longitude = geocodePromiseResult[0];

      // Calculate distance from selected address to returned addresses from database
      compsDataArray.forEach(function(record) {
        var addressLatitude = record.latitude;
        var addressLongitude = record.longitude;
        var distanceKM = getDistanceFromLatLonInKm(addressLatitude, addressLongitude,latitude,longitude);
        record.distance_from_selected = distanceKM;
      })

      // Sort dataset that now includes distance by smallest -> largest distance
      // top 5 closest properties from dataset will be selected comparable properties
      sorted_data_distance = compsDataArray.sort( (a, b) => a.distance_from_selected - b.distance_from_selected);

      // -----------------------------------------------------

      // Add selected address to map -> use red icon to make it stand out
      // Adapted from https://github.com/pointhi/leaflet-color-markers
      // Comp addresses will be blue icons
      var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      var marker = L.marker([latitude,longitude], {icon:redIcon}).addTo(myMap);
      marker.bindPopup(`<b>Selected Address:</b><br>${streetAddress}`);
      // Center map around selected address
      myMap.flyTo(new L.LatLng(latitude, longitude),14);

      // Grab 5 most recent comparible sales
      // var top5values = sorted_data.slice(0,5);
      var top5values = sorted_data_distance.slice(0,5);

      // Calculate total sale price and total square footage of comps
      var salePrices = top5values.map(record => record.sale_price);
      var totalSalePrices = d3.sum(salePrices);
      var squareFootageValues = top5values.map(record => record.total_liveable_area);
      var totalSquareFootageValues = d3.sum(squareFootageValues);

      // Calculate avg price/sq. ft. for comps
      var compsAvgPricePerSquareFoot = totalSalePrices / totalSquareFootageValues;

      // Retrieve target property square footage
      var targetSquareFootage = d3.select("#square_feet").property("value");

      // Calculate target property comps valuation
      var targetCompsValuation = compsAvgPricePerSquareFoot * targetSquareFootage;

      // Map each comp result and list relevant information
      var counter = 0;
      top5values.forEach(function(record) {

        // Declare variables for results to be displayed in comp marker tooltips

        var formatComma = d3.format(",");
        var formatDate = d3.timeFormat("%b %d, %Y");

        var streetAddress = record.location;
        var saleDate = formatDate(Date.parse(record.sale_date));
        var salePrice = formatComma(record.sale_price);
        var totalRooms = record.number_of_rooms;
        var bedrooms = record.number_of_bedrooms;
        var bathrooms = record.number_of_bathrooms;
        var squareFootage = formatComma(record.total_liveable_area);
        // Retrieve current year so that age can be calculated based on year built
        var currYear = new Date().getFullYear();
        var compAge = currYear - record.year_built; 
        
        // Map relevant comp addresses
        var addressLatitude = record.latitude;
        var addressLongitude = record.longitude;
        var compMarker = L.marker([addressLatitude,addressLongitude]).addTo(myMap);
        counter++;
        compMarker.bindPopup(`<b>Comp ${counter}: ${streetAddress}</b>
                                 <br>
                                 <ul>
                                 <li>Sale Date: ${saleDate}</li>
                                 <li>Sale Price: $${salePrice}</li>
                                 <li>Total Rooms: ${totalRooms}</li>
                                 <li>Bedrooms: ${bedrooms}</li>
                                 <li>Bathrooms: ${bathrooms}</li>
                                 <li>Square Footage: ${squareFootage}</li>
                                 <li>Age: ${compAge}</li>
                                 </ul>`);
        
      });

      // Update table with comp valuation result
      var compValuationResult = d3.select("#comp-valuation-result");
      var formatComma = d3.format(",");
      compValuationResult.text(`$${formatComma(Math.round(targetCompsValuation))}`);

      // Compare comp valuation result to entered list price
      var listPrice = d3.select("#list_price").property("value");
      var compVsListPriceDiff = targetCompsValuation - listPrice;
      var compVsListPriceDiffResult = d3.select("#comp-valuation-over-under");
      var formatCurrency = d3.format("(,");
      compVsListPriceDiffResult.text(`$${formatCurrency(Math.round(compVsListPriceDiff))}`);


      // Retrieve parameters to be used in monthly mortgage payment calculations
      var inputDownPayment = d3.select("#down_payment").property("value");
      var inputInterestRate = d3.select("#interest_rate").property("value");
      var inputMortgageLength = d3.select("#mortgage_length").property("value");

      // Calculate monthly mortgage payment for comps valuation
      var compsValuationMonthlyPayment = calcMonthlyPayment(targetCompsValuation, inputDownPayment, inputInterestRate, inputMortgageLength);
      var compsValuationMonthlyPaymentResult = d3.select("#comp-valuation-monthly-payment");
      compsValuationMonthlyPaymentResult.text(`$${formatComma(Math.round(compsValuationMonthlyPayment))}`);

      // Calculate monthly mortgage payment for list price
      var listPrice = d3.select("#list_price").property("value");
      var listPriceMonthlyPayment = calcMonthlyPayment(listPrice, inputDownPayment, inputInterestRate, inputMortgageLength);
      var listPriceMonthlyPaymentResult = d3.select("#current-listing-monthly-payment")
      listPriceMonthlyPaymentResult.text(`$${formatComma(Math.round(listPriceMonthlyPayment))}`);

      // Calculate monthly mortgage payment for assumed sale price
      var salePrice = d3.select("#sale_price").property("value");
      var salePriceMonthlyPayment = calcMonthlyPayment(salePrice, inputDownPayment, inputInterestRate, inputMortgageLength);
      var salePriceMonthlyPaymentResult = d3.select("#current-sale-price-monthly-payment")
      salePriceMonthlyPaymentResult.text(`$${formatComma(Math.round(salePriceMonthlyPayment))}`);

      // Calculate monthly mortgage payment for regression valuation

      // Change URLs in table to be clickable - remove "disabled-href" class
      var compsURL = d3.select("#comp-valuation-href");
      compsURL.classed("disabled-href", false);

      var regressionURL = d3.select("#regression-valuation-href");
      regressionURL.classed("disabled-href", false);

      var overallURL = d3.select("#overall-valuation-href");
      overallURL.classed("disabled-href", false);

      // Update hrefs of URLs to take in relevant output results
      // Declare relevant output variables to be passed into drill-through URL
      var targetPropertySquareFootage = d3.select("#square_feet").property("value")
      var comp1SquareFootage = top5values[0].total_liveable_area;
      var comp2SquareFootage = top5values[1].total_liveable_area;
      var comp3SquareFootage = top5values[2].total_liveable_area
      var comp4SquareFootage = top5values[3].total_liveable_area
      var comp5SquareFootage = top5values[4].total_liveable_area

      var comp1SalePrice = top5values[0].sale_price
      var comp2SalePrice = top5values[1].sale_price
      var comp3SalePrice = top5values[2].sale_price
      var comp4SalePrice = top5values[3].sale_price
      var comp5SalePrice = top5values[4].sale_price

      compsURLNewHref = `/comps-drill-through/${streetAddress}/${zipCode}/${targetPropertySquareFootage}/${comp1SquareFootage}/${comp2SquareFootage}/${comp3SquareFootage}/${comp4SquareFootage}/${comp5SquareFootage}/${comp1SalePrice}/${comp2SalePrice}/${comp3SalePrice}/${comp4SalePrice}/${comp5SalePrice}`;
      
      compsURL.attr("href",compsURLNewHref);

      });

      // SlickLoader.disable();
    
};
    
// END: Function to perform all operations related to computing comps analysis
// ----------

// ----------
// 3b.) Function to perform all operations related to computing regression analysis

function computeRegressionAnalysis() {

  // Create JSON promise for regression coefficients
  var coefficientsPromise = getRegressionCoefficients();
  // Create JSON promise for regression r^2
  var rSquaredPromise = getRegressionRSquared();

  // When both promise results are returned, execute remaining downstream logic
  Promise.all([coefficientsPromise, rSquaredPromise]).then(values => {
    var coefficientResults = values[0];
    var rSquaredResults = values[1];

    // Get inputs to be used in regression calculations
    var finishedBasement = d3.select("#finished_basement").property("value");
    var centralAir = d3.select("#central_air").property("value");
    var numberOfBedrooms = d3.select("#number_bedrooms").property("value");
    var numberOfBathrooms = d3.select("#number_bathrooms").property("value");
    var squareFootage = d3.select("#square_feet").property("value");
    var interiorCondition = d3.select("#interior_condition").property("value");
    var parkingSpaces = d3.select("#parking_spaces").property("value");
    // Retrieve current year to calculate age
    var currDate = new Date()
    var currYear = currDate.getFullYear()
    var yearBuilt = d3.select("#year_built").property("value");
    var age = currYear - yearBuilt;

    // Get regression Coefficients
    var finishedBasementCoefficient = coefficientResults.full_finished_basement_Y;
    var centralAirCoefficient = coefficientResults.central_air_Y;
    var numberOfBedroomsCoefficient = coefficientResults.number_of_bedrooms;
    var numberOfBathroomsCoefficient = coefficientResults.number_of_bathrooms;
    var squareFootageCoefficient = coefficientResults.total_livable_area;
    var interiorConditionCoefficient = coefficientResults.interior_condition;
    var parkingSpacesCoefficient = coefficientResults.garage_spaces;
    var ageCoefficient = coefficientResults.age

    // Calculate regression valuation based off of retrieved coefficients
    var regressionValuation = (finishedBasement * finishedBasementCoefficient) + 
                                    (centralAir * centralAirCoefficient) + 
                                    (numberOfBedrooms * numberOfBedroomsCoefficient) + 
                                    (numberOfBathrooms * numberOfBathroomsCoefficient) + 
                                    (squareFootage * squareFootageCoefficient) + 
                                    (interiorCondition * interiorConditionCoefficient) + 
                                    (parkingSpaces * parkingSpacesCoefficient) + 
                                    (age * ageCoefficient)

    // Populate HTML table with regression valuation results
    var regressionValuationResult = d3.select("#regression-valuation-result");
    var formatComma = d3.format(",");
    regressionValuationResult.text(`$${formatComma(Math.round(regressionValuation))}`);

    // Compare regression valuation result to entered list price
    var listPrice = d3.select("#list_price").property("value");
    var regressionVsListPriceDiff = regressionValuation - listPrice;
    var regressionVsListPriceDiffResult = d3.select("#regression-valuation-over-under");
    var formatCurrency = d3.format("(,");
    regressionVsListPriceDiffResult.text(`$${formatCurrency(Math.round(regressionVsListPriceDiff))}`);


    // Retrieve parameters to be used in monthly mortgage payment calculations
    var inputDownPayment = d3.select("#down_payment").property("value");
    var inputInterestRate = d3.select("#interest_rate").property("value");
    var inputMortgageLength = d3.select("#mortgage_length").property("value");

    // Calculate monthly payment based on regression valuation
    var regressionValuationMonthlyPayment = calcMonthlyPayment(regressionValuation, inputDownPayment, inputInterestRate, inputMortgageLength);
    var regressionValuationMonthlyPaymentResult = d3.select("#regression-valuation-monthly-payment");
    regressionValuationMonthlyPaymentResult.text(`$${formatComma(Math.round(regressionValuationMonthlyPayment))}`);

    // Update hrefs of URLs to take in relevant output results
    // Declare relevant output variables to be passed into drill-through URL
    var regressionURL = d3.select("#regression-valuation-href");

    // Round regression coefficients to 4 decimals to bring into drill through
    var finishedBasementCoefficientRounded = Math.round(finishedBasementCoefficient * 10000) / 10000
    var centralAirCoefficientRounded = Math.round(centralAirCoefficient * 10000) / 10000;
    var numberOfBedroomsCoefficientRounded = Math.round(numberOfBedroomsCoefficient * 10000) / 10000;
    var numberOfBathroomsCoefficientRounded = Math.round(numberOfBathroomsCoefficient * 10000) / 10000;
    var squareFootageCoefficientRounded = Math.round(squareFootageCoefficient * 10000) / 10000;
    var interiorConditionCoefficientRounded = Math.round(interiorConditionCoefficient * 10000) / 10000;
    var parkingSpacesCoefficientRounded = Math.round(parkingSpacesCoefficient * 10000) / 10000;
    var ageCoefficientRounded = Math.round(ageCoefficient * 10000) / 10000;

    regressionURLNewHref = `/model-drill-through/${finishedBasement}/${centralAir}/${numberOfBedrooms}/${numberOfBathrooms}/${squareFootage}/${interiorCondition}/${parkingSpaces}/${age}/${Math.round(regressionValuation)}/${finishedBasementCoefficientRounded}/${centralAirCoefficientRounded}/${numberOfBedroomsCoefficientRounded}/${numberOfBathroomsCoefficientRounded}/${squareFootageCoefficientRounded}/${interiorConditionCoefficientRounded}/${parkingSpacesCoefficientRounded}/${ageCoefficientRounded}`;
    regressionURL.attr("href",regressionURLNewHref);

    // Calculate overall valuation using r^2 as weight
    // var rSquared = rSquaredResults.rsquared;
    // var oneMinusRSquared = 1 - rSquared;

    // var compsValuation = d3.select("#comp-valuation-result").text();
    // var compsValuationFloat = parseFloat(compsValuation.replace("$","").replace(",",""));
    // var compsValuationWeighted = compsValuationFloat * oneMinusRSquared;

    // var regressionValuationWeighted = regressionValuation * rSquared;
    // var overallValuation = compsValuationWeighted + regressionValuationWeighted;

    // // Populate overall valuation into html table
    // var overallValuationResult = d3.select("#overall-valuation-result");
    // overallValuationResult.text(`$${formatComma(Math.round(overallValuation))}`);

    // // Compare overall valuation result to entered list price
    // var overallVsListPriceDiff = overallValuation - listPrice;
    // var overallVsListPriceDiffResult = d3.select("#overall-valuation-over-under");
    // var formatCurrency = d3.format("(,");
    // overallVsListPriceDiffResult.text(`$${formatCurrency(Math.round(overallVsListPriceDiff))}`);

  });

};


// END: Function to perform all operations related to computing regression analysis
// ----------

// ----------
// 3c.) Function to compute overall valuation and insights section
function computeOverallValuation() {
    // Create JSON promise for regression r^2
    var rSquaredPromise = getRegressionRSquared();

    rSquaredPromise.then(function(response) {
      var listPrice = d3.select("#list_price").property("value");
      var rSquared = response[0].rsquared;
      console.log(rSquared);
      var oneMinusRSquared = 1 - rSquared;

      var compsValuation = d3.select("#comp-valuation-result").text();
      var compsValuationFloat = parseFloat(compsValuation.replace("$","").replace(",",""));
      var compsValuationWeighted = compsValuationFloat * oneMinusRSquared;

      var regressionValuation = d3.select("#regression-valuation-result").text();
      var regressionValuationFloat = parseFloat(regressionValuation.replace("$","").replace(",",""));
      var regressionValuationWeighted = regressionValuationFloat * rSquared;
      var overallValuation = compsValuationWeighted + regressionValuationWeighted;

      // Populate overall valuation into html table
      var formatComma = d3.format(",");
      var overallValuationResult = d3.select("#overall-valuation-result");
      overallValuationResult.text(`$${formatComma(Math.round(overallValuation))}`);

      // Compare overall valuation result to entered list price
      var overallVsListPriceDiff = overallValuation - listPrice;
      var overallVsListPriceDiffResult = d3.select("#overall-valuation-over-under");
      var formatCurrency = d3.format("(,");
      overallVsListPriceDiffResult.text(`$${formatCurrency(Math.round(overallVsListPriceDiff))}`);
    });
}
// ----------

// END: CODE TO EXECUTE UPON CALCULATING ANALYSIS
// -----------------------------------

// -----------------------------------
// 4.) Supplemental Web Scrape Functions

// ----------
// 4a.) Scrape 30 year fixed rate from Freddie Mac
function scrapeInterestRate() {
  var queryURL = "/api/v1.0/data/interest_rate";
  d3.json(queryURL).then(function(response) {
    var interestRate = response[0].thirty_yr_rate;
    var interestRateInput = d3.select("#interest_rate");
    interestRateInput.property("value",interestRate);

  })
}

// ----------

// -----------------------------------

// -----------------------------------
// 4.) EVENT LISTENERS

// ----------
// 4a.) Event listener for pressing "Compute Property Analysis" button
d3.select("#submit-button").on("click", function () {
  
  // Enable slickloader
  SlickLoader.enable();

  // Run computeCompsAnalysis() function defined above to calculate comp valuation
  computeCompsAnalysis();

  // Run computeRegressionAnalysis() function defined above to calculate regression valuation
  computeRegressionAnalysis();
  
  // Disable slickloader
  SlickLoader.disable();
});

// END: Event listener for pressing "Compute Property Analysis" button
// ----------

// ----------
// 4b.) Button to reset page
d3.select("#reset-button").on("click", function() {
  // Enable slickloader
  SlickLoader.enable();

  // Reload page
  location.reload();

  // Disable slickloader
  SlickLoader.disable();

});

// END: Button to reset page
// ----------

// ----------
// 4c.) Link to calculate overall valuation
// NOTE: ideally would calculate without having to click extra
// Issue is that comp valuation result doesn't return back before regression due to asynchronous processing
// So this is just a workaround for now
d3.select("#overall-valuation-href").on("click", function () {
    // Enable slickloader
    SlickLoader.enable();

    computeOverallValuation();

    // Disable slickloader
    SlickLoader.disable();
})
// ----------

// 4d.) Function to scrape interest rate from Freddie Mac
d3.select("#freddie-mac-scrape").on("click", function () {

  // Enable slickloader
  SlickLoader.enable();

  scrapeInterestRate();

  // Disable slickloader
  SlickLoader.disable();

})

// END: EVENT LISTENERS
// -----------------------------------

