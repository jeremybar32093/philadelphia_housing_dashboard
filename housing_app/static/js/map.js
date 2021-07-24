  // 5a.) Getting data from Flask app
var query_url;

// Creating map object
var myMap = L.map("map", {
    center: [39.95, -75.17],
    zoom: 11
  });
  
  // Adding tile layer to the map
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

  ///////////////////////////////////////////////////

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
       addresses = response.map(address => `${address.location} Philadelphia PA ${address.zip_code}`)
       addresses_encoded = addresses.map(encoded_addressses => encodeURIComponent(encoded_addressses))
       console.log(addresses)
       var markers = L.markerClusterGroup();

  
  // Store API query variables
  var baseURL2 = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
    
    for (var i = 0; i < addresses_encoded.length; i++) {
        var link = baseURL2 + addresses_encoded[i] + ".json?access_token=" + API_KEY;

        d3.json(link).then(function(location) {
        layer = markers.addLayer(L.marker([location.features[0].geometry.coordinates[1], location.features[0].geometry.coordinates[0]]))
        
        myMap.addLayer(layer)
    });


                                    }
                                    
                                })})