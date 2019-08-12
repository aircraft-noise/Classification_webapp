
//Google maps API initialisation
var element = document.getElementById("map");

var map = new google.maps.Map(element, {
    center: new google.maps.LatLng(37.5733, -122.1523),
    zoom: 9,
    mapTypeId: "OSM",
});

google.maps.event.addListener(map, 'click', function (event) {
    displayCoordinates(event.latLng);
});

function displayCoordinates(pnt) {
    var lat = pnt.lat();
    lat = lat.toFixed(6);
    var lng = pnt.lng();
    lng = lng.toFixed(6);
    document.getElementById("newVOlat").value = lat;
    document.getElementById("newVOlon").value = lng;
    //getElev();
}

function getElev() {
    lat = document.getElementById("newlat").value;
    lng = document.getElementById("newlon").value;
    fetch("https://predict.stanfordssi.org/elev?lat=" + lat + "&lon=" + lng).then(res => res.json()).then((result) => {
        document.getElementById("alt").value = result
    })
}

//Define OSM map type pointing at the OpenStreetMap tile server
map.mapTypes.set("OSM", new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
        // "Wrap" x (longitude) at 180th meridian properly
        // NB: Don't touch coord.x: because coord param is by reference, and changing its x property breaks something in Google's lib
        var tilesPerGlobe = 1 << zoom;
        var x = coord.x % tilesPerGlobe;
        if (x < 0) {
            x = tilesPerGlobe+x;
        }
        // Wrap y (latitude) in a like manner if you want to enable vertical infinite scrolling

        return "https://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 18
}));

