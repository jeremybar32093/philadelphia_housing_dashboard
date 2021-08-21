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
// 3a.) Function to execute upon clicking 'Compute Property Analysis' button

function computePropertyAnalysis() {
  
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

    // Use promise.all to return both promises, allowing for ability to work with both data results
    // NOTE: comps currently calculating based off of 5 most recent comparable sales
    // AS an enhancement, calculate distance for each record in comps dataset returned back and return the 5 closest rather than 5 most recent
    // In order to execute this, likely need to geocode dataset on the back end
    Promise.all([geocodePromise, compsDataPromise]).then(values => {
      
      var geocodePromiseResult = values[0];
      var compsDataPromiseResult = values[1];

      // Extract longitude/latitude from selected address
      var latitude = geocodePromiseResult[1];
      var longitude = geocodePromiseResult[0];

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

      // Sort filtered dataset based on most recent
      var sorted_data = compsDataPromiseResult.sort(function(a,b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.sale_date) - new Date(a.sale_date);
      });

      // Grab 5 most recent comparible sales
      var top5values = sorted_data.slice(0,5);

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
        // Define counter to display in html tooltip
        counter +=1;
        // Declare address to pass into mapbox API and retrieve result
        var address = `${record.location} Philadelphia PA ${record.zip_code}`;
        var addressGeocodePromise = getCoordsFromAddress(address);
        console.log(addressGeocodePromise);

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
        
        
        // Create markers for 
        addressGeocodePromise.then(function(response) {
          var addressLatitude = response[1];
          var addressLongitude = response[0];
          var compMarker = L.marker([addressLatitude,addressLongitude]).addTo(myMap);
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


      // compsDataPromiseResult.forEach(function(record) {
      //   var address = `${record.location} Philadelphia PA ${record.zip_code}`;
      //   var addressGeocodePromise = getCoordsFromAddress(address);

      //   addressGeocodePromise.then(function(response) {
      //     var addressLatitude = response[1];
      //     var addressLongitude = response[0];
      //     var distanceKM = getDistanceFromLatLonInKm(addressLatitude, addressLongitude,latitude,longitude);
      //     record["latitude"] = addressLatitude;
      //     record["longitude"] = addressLongitude;
      //     record["distance_from_selected"] = distanceKM;
      //   });

      });

    // });

    // geocodePromise.then(function(response) {
    //   var latitude = response[1]
    //   var longitude = response[0]
    //   // Define custom color icon
    //   // Pulled from https://github.com/pointhi/leaflet-color-markers
    //   var redIcon = new L.Icon({
    //     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    //     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowSize: [41, 41]
    //   });

    //   var marker = L.marker([latitude,longitude], {icon:redIcon}).addTo(myMap);
    //   marker.bindPopup(`<b>Selected Address:</b><br>${streetAddress}`);
    //   // Center map around selected address
    //   myMap.flyTo(new L.LatLng(latitude, longitude),14);
      
    //   return latitude;
    
    // }).then(function(response2) {
    //   console.log(latitude);
    // });
};
    // geocodePromise.then(function(result) {
    //   $scope.coordinateResult = result;
    // })

    // console.log(geocodePromise);
    

    // var geocodeResult = geocodePromise.then(function(response) {
    //                 return response;
    //               })
    //               .then(function(data) {
    //                 return data;
    //               })
    // console.log(geocodeResult);
  // // Create address line to pass into geocode

  // var geocodePromise = callGeocodeAPI(selectedAddressLine);

  // compsQueryString = getCompsQueryString();
  // compsData = getCompsData(compsQueryString);

  // compsData.then(function(response) {


  //   for(var i=0; i < response.length + 1; i++) {
  //     if (i === 0) {
  //       var geocodePromise = callGeocodeAPI(selectedAddressLine);
  //     } else {
  //       var responseAddress = `${response[i-1].location} Philadelphia PA ${response[i-1].zip_code}`;
  //       var geocodePromise = callGeocodeAPI()
  //     }
  //   };
    // console.log(response);
    // console.log(selectedAddressLine);



  // });

  // console.log(compsData);

  // compsData.then(function(response) {
  //     // Loop through response
  //     // Calculate longitude and latitude coordinates and attach to response records

  //     var updatedCompsData = response;

  //     updatedCompsData.forEach(function(record) {
  //       var address = `${record.location} Philadelphia PA ${record.zip_code}`;
  //       var addressGeocodePromise = callGeocodeAPI(address);
  //       addressGeocodePromise.then(function(response) {
  //         var addressCoordinateResult = response.features[0].center;
  //         var addressLatitude = addressCoordinateResult[1];
  //         var addressLongitude = addressCoordinateResult[0];

  //         geocodePromise.then(function(response) {
  //           var coordinateResult = response.features[0].center;
  //           var latitude = coordinateResult[1]
  //           var longitude = coordinateResult[0]
  //           // Define custom color icon
  //           // Pulled from https://github.com/pointhi/leaflet-color-markers
  //           var redIcon = new L.Icon({
  //             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  //             shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  //             iconSize: [25, 41],
  //             iconAnchor: [12, 41],
  //             popupAnchor: [1, -34],
  //             shadowSize: [41, 41]
  //           });

  //           var marker = L.marker([latitude,longitude], {icon:redIcon}).addTo(myMap);
  //           marker.bindPopup(`<b>Selected Address:</b><br>${streetAddress}`);
  //           // Center map around selected address
  //           myMap.flyTo(new L.LatLng(latitude, longitude),14);
  //         });

  //         var distanceKM = getDistanceFromLatLonInKm(addressLatitude, addressLongitude,latitude,longitude);
  //         record["latitude"] = addressLatitude;
  //         record["longitude"] = addressLongitude;
  //         record["distance_from_selected"] = distanceKM;
  //         // return addressLatitude;
  //       });
  //       // record["latitude"] = addressLatitude;
  //       // record["longitude"] = addressLongitude;
  //       // record["distance_from_selected"] = distanceKM;
  //     });

  //     console.log(updatedCompsData);
  // });

  
  // Add marker for selected address to map
  // geocodePromise.then(function(response) {
  //   var coordinateResult = response.features[0].center;
  //   var latitude = coordinateResult[1]
  //   var longitude = coordinateResult[0]
  //   // Define custom color icon
  //   // Pulled from https://github.com/pointhi/leaflet-color-markers
  //   var redIcon = new L.Icon({
  //     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  //     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //     popupAnchor: [1, -34],
  //     shadowSize: [41, 41]
  //   });

  //   var marker = L.marker([latitude,longitude], {icon:redIcon}).addTo(myMap);
  //   marker.bindPopup(`<b>Selected Address:</b><br>${streetAddress}`);
  //   // Center map around selected address
  //   myMap.flyTo(new L.LatLng(latitude, longitude),14);

  //   return latitude;
  // })

// };





//   // Add marker for selected address to map
//   geocodePromise.then(function(response) {
//     var coordinateResult = response.features[0].center;
//     var latitude = coordinateResult[1]
//     var longitude = coordinateResult[0]
//     // Define custom color icon
//     // Pulled from https://github.com/pointhi/leaflet-color-markers
//     var redIcon = new L.Icon({
//       iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
//       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowSize: [41, 41]
//     });
//     var marker = L.marker([latitude,longitude], {icon:redIcon}).addTo(myMap);
//     marker.bindPopup(`<b>Selected Address:</b><br>${streetAddress}`);
//     // Center map around selected address
//     myMap.flyTo(new L.LatLng(latitude, longitude),14);

//     // Create string to return back data to calculate comp distances
//     // And ultimately also add to map
//     compsQueryString = getCompsQueryString();
//     compsData = getCompsData(compsQueryString);

//       return response;
//     });

//   };


// };

// END: Function to execute upon clicking 'Compute Property Analysis' button
// ----------

// END: CODE TO EXECUTE UPON CALCULATING ANALYSIS
// -----------------------------------

// -----------------------------------
// 4.) EVENT LISTENERS

// END: EVENT LISTENERS
// -----------------------------------

