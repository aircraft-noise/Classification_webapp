//lastwaypoint is the counter to make a new VO
let lastwaypoint = 0;
//master_struct is the data structure which holds the original dict of VOs grouped by route
let master_struct = {};

let waypointtoRoute = {};
let waypointtoIndex = {};

//Getting the header list of the classification rule base keys
let HEADER = [];
fetch('/header')
    .then(data=>{return data.json()})
    .then(res=>{
        HEADER = res;
    });

//GET request to get VO dictionary
const url='/waypoints';
fetch(url)
    .then(data=>{return data.json()})
    .then(res=>{
        initMap(res);

    });


//Making list of markers for using to clear the map later
let listOfMarkers = [];
let listOfLines = [];
let HeaderHTML = "";

//Function to initialise the map
function initMap(listway) {
    master_struct = listway;
    //clear everything
    clearMap();
    document.getElementById("waypntstable").innerHTML = null;



    var optselct = document.createElement("select");
    optselct.className = "form-control";

    for (var index in HEADER){
        var opt = document.createElement("option");
        opt.id = "option-"+index;
        opt.value = HEADER[index];
        opt.innerText = HEADER[index];

        optselct.appendChild(opt);
    }


    //Make table heading
    var heading = document.createElement("tr");
    heading.id = "tablehead";
    heading.innerHTML = "<th id =\"namehead\">Name:</th><th id =\"dropdown1\"></th><th id =\"dropdown2\"></th>";

    document.getElementById("waypntstable").appendChild(heading);

    optselct.id = "drop1";
    optselct.value = "lat";

    var optselct2 = optselct.cloneNode(true);
    optselct2.id = "drop2";
    optselct2.value = "long";
    // document.getElementById("drop1").addEventListener("change",updateFront(optselct.value,optselct2.value));


    document.getElementById("dropdown1").appendChild(optselct);
    document.getElementById("dropdown2").appendChild(optselct2);


    //document.getElementById("drop2").addEventListener("change",updateFront(optselct.value,optselct2.value));

    HeaderHTML = document.getElementById("waypntstable").innerHTML;
    updateFront();

}

function changedData(){
    let v1 = $('#drop1').val();
    let v2 = $('#drop2').val();
    document.getElementById("waypntstable").innerHTML = HeaderHTML;
    $('#drop1').val(v1);
    $('#drop2').val(v2);
    updateFront();
}

$(document.body).on("change","select",function(){
    changedData()
});

$(document.body).on("change",".tableinput",function(){
    let wpoint = (this.id).slice(0,-5);
    let key = $('#drop1').val();
    let val = $(this).val();
    let route = waypointtoRoute[wpoint];
    let index = waypointtoIndex[wpoint];
    master_struct[route][index][key] = val;
    changedData()
});


//$(document).on('change', 'select', updateFront());

function clearMap(){
    for (index in listOfMarkers){
        listOfMarkers[index].setMap(null);
    }
    listOfMarkers = [];

    for (index2 in listOfLines){
        listOfLines[index2].setMap(null);
    }
    listOfLines = [];
}

function addRouteToMap(polylinelist, routename){
    var routepath = new google.maps.Polyline({
        path: polylinelist,
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    listOfLines.push(routepath);

    var routeinfowindow = new google.maps.InfoWindow({
        content: routename
    });
    routepath.addListener('mouseover', function (e) {
        routeinfowindow.setPosition(e.latLng);
        routeinfowindow.open(map);
    });

    routepath.addListener('mouseout', function () {
        routeinfowindow.close(map);
    });

    routepath.setMap(map);
}

function addWaypointToMap(name,cen){
    var cityCircle = new google.maps.Marker({
        position: cen,
        map: map,
        title: name,
        draggable: true,
        label: {
            color: 'black',
            fontWeight: 'bold',
            text: name,
        },
    });

    listOfMarkers.push(cityCircle);


    google.maps.event.addListener(cityCircle, 'dragend', function()
    {
        let wpnt = cityCircle.getTitle();
        let rt = waypointtoRoute[wpnt];
        let indx = waypointtoIndex[wpnt];
        master_struct[rt][indx]["lat"] = cityCircle.getPosition().lat().toFixed(6);
        master_struct[rt][indx]["long"] = cityCircle.getPosition().lng().toFixed(6);
        changedData()
    });

    var infowindow = new google.maps.InfoWindow({
        content: cityCircle.getTitle()
    });
    cityCircle.addListener('click', function () {
        infowindow.open(map, cityCircle);
    });
}


function addWaypointToCol(wname, wcolid, wlat, wlng){
    var col = document.createElement("tr");
    col.id = wcolid;

    col.innerHTML = "<th><span id="+wname+"-name >"+wname+"</span></th>\n" +
        "                    <th><input class=\"tableinput\" id="+wname+"-col1 value="+wlat+"></input></th>\n" +
        "                    <th><input class=\"tableinput\" id="+wname+"-col2 value="+wlng+"></input></th>" +
        "<button type=\"button\" class=\"close\" aria-label=\"Close\" id=\"rmvbutton\" onclick=\"removeWaypoint(\'"+wname+"\')\"   " +
        "  <span aria-hidden=\"true\">&times;</span>\n" +
        "</button>";
    document.getElementById("waypntstable").appendChild(col);
}

function updateFront(column1 = $("#drop1").val(), column2 = $("#drop2").val()){
    clearMap();
    let listway = master_struct;
    let count = 0;
    for (var route in listway) {
        let polylinelist = [];
        (function () {
            let cen = {};
            for (var waypoint in listway[route]){
                (function (){
                    let name = listway[route][waypoint]["Waypoint"];
                    waypointtoRoute[name] = route;
                    waypointtoIndex[name] = waypoint;
                    let datacol1 = listway[route][waypoint][column1];
                    let datacol2 = listway[route][waypoint][column2];
                    cen['lat'] = parseFloat(listway[route][waypoint]["lat"]);
                    cen['lng'] = parseFloat(listway[route][waypoint]["long"]);
                    polylinelist.push(new google.maps.LatLng(cen['lat'], cen['lng']));
                    let colid = "Waypoint-"+count;
                    addWaypointToCol(name,colid,datacol1,datacol2);
                    addWaypointToMap(name,cen);
                }());
                count++
            }
        }());
        //add polyline here:
        addRouteToMap(polylinelist, route);
        polylinelist = [];

        lastwaypoint = count;

    }
}


function removeWaypoint(id){
    let indx = waypointtoIndex[id];
    let rt = waypointtoRoute[id];
    master_struct[rt].splice(indx,1);
    changedData();
    return false;
}


function addNewVO(){
    let newVO = {};
    newVO['Waypoint'] = document.getElementById("newVOname").value;
    newVO['Route Name'] = document.getElementById("newVOroute").value;
    newVO['lat'] = parseFloat(document.getElementById("newVOlat").value);
    newVO['long'] = parseFloat(document.getElementById("newVOlon").value);
    newVO['track_min'] = parseFloat(document.getElementById("newVOtrackmin").value);
    newVO['track_max'] = parseFloat(document.getElementById("newVOtrackmax").value);
    newVO['alt_min'] = parseFloat(document.getElementById("newVOaltmin").value);
    newVO['alt_max'] = parseFloat(document.getElementById("newVOaltmax").value);
    newVO['ground_speed_min'] = parseFloat(document.getElementById("newVOgspeedmin").value);
    newVO['ground_speed_max'] = parseFloat(document.getElementById("newVOgspeedmax").value);
    newVO['vrate_min'] = parseFloat(document.getElementById("newVOvratemin").value);
    newVO['vrate_max'] = parseFloat(document.getElementById("newVOvratemax").value);
    newVO['ground_distance_min'] = parseFloat(document.getElementById("newVOgdistmin").value);
    newVO['ground_distance_max'] = parseFloat(document.getElementById("newVOgdistmax").value);

    console.log(newVO['Route Name']);
    if(newVO['Route Name'] in master_struct){
        master_struct[newVO['Route Name']].push(newVO);
        console.log("added to ", master_struct);
    }
    else{
        master_struct[newVO['Route Name']] = [];
        master_struct[newVO['Route Name']].push(newVO);
    }
    changedData();

}



function savetoCSV(){
    csvfile = [];
    csvfile.push(HEADER.reverse());
    for(route in master_struct) {
        for (each in master_struct[route]) {
            let eachline = [];
            for(eachHead in HEADER){
                console.log(eachHead);
                eachline.push(master_struct[route][each][HEADER[eachHead]]);
            }
            csvfile.push(eachline);
        }
    }
    console.log(csvfile);
    exportToCsv("waypoints.csv",csvfile);
    //console.log(csvfile);
    //var values = Object.keys(dictionary).map(function(key){

}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}