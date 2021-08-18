// -----------------------------------
// 1.) HELPER FUNCTION DEFINITIONS

// ----------

// 1a.) Define function to geocode address
function callGeocodeAPI(address) {
  var geocodeAPIBaseURL = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  var encodedAddress = encodeURIComponent(address);
  var apiCallLink = `${geocodeAPIBaseURL}${encodedAddress}.json?access_token=${API_KEY}`;
  // Perform API call using D3
  var geocodePromise = d3.json(apiCallLink).then(function(response) {
    return response;
  });
  return geocodePromise;
}

// END: Define function to geocode address
// ----------

// ----------
// 1b.) Define function to query and return back data for comps valuation

// ********* DEFINE QUERY STRING BASED ON IMPT REGRESSION VARIABLES *******

// END: Define function to query and return back data for comps valuation
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

  // Create address line to pass into geocode
  var addressLine = `"${streetAddress} ${streetAddress2} ${city} ${state} ${zipCode}"`;
  var geocodePromise = callGeocodeAPI(addressLine);

  // Add marker for selected address to map
  geocodePromise.then(function(response) {
    var coordinateResult = response.features[0].center;
    console.log(coordinateResult);
    var latitude = coordinateResult[1]
    var longitude = coordinateResult[0]
    // Define custom color icon
    // Pulled from https://github.com/pointhi/leaflet-color-markers
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
  })


};

// END: Function to execute upon clicking 'Compute Property Analysis' button
// ----------

// END: CODE TO EXECUTE UPON CALCULATING ANALYSIS
// -----------------------------------

// -----------------------------------
// 4.) EVENT LISTENERS

// END: EVENT LISTENERS
// -----------------------------------

