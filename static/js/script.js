    //lastwaypoint is the counter to make a new VO
    let lastwaypoint = 0;
    //master_struct is the data structure which holds the original dict of VOs grouped by route
    let master_struct = {};

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
        $(document.body).on("change","select",function(){
            let v1 = $('#drop1').val();
            let v2 = $('#drop2').val();
            document.getElementById("waypntstable").innerHTML = HeaderHTML;

            $('#drop1').val(v1);

            $('#drop2').val(v2);


            updateFront();
        });


    }



    //$(document).on('change', 'select', updateFront());

    function clearMap(){
        for (index in listOfMarkers){
            listOfMarkers[index].setMap(null);
        }
        listOfMarkers = [];
    }

    function addRouteToMap(polylinelist, routename){
        var routepath = new google.maps.Polyline({
            path: polylinelist,
            geodesic: true,
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

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

        google.maps.event.addListener(cityCircle, "drag", function(){

            let latid = cityCircle.getTitle() + "-col";

            //document.getElementById(latid).value = cityCircle.getPosition().lat().toFixed(6);
            let longid = cityCircle.getTitle() + "-long";
            //document.getElementById(longid).value = cityCircle.getPosition().lng().toFixed(6);
            //TODO ADD TO MASTER_STRUCT HERE
        });

        var infowindow = new google.maps.InfoWindow({
            content: cityCircle.getTitle()
        });
        cityCircle.addListener('click', function () {
            infowindow.open(map, cityCircle);
        });
    }

    function addNewWaypoint(){
        let n = document.getElementById("newname").value;
        let lt = document.getElementById("newlat").value;
        let ln = document.getElementById("newlon").value;
        let npos = {};
        npos['lat'] = parseFloat(lt);
        npos['lng'] = parseFloat(ln);
        addWaypointToCol(n,"Waypoint-"+lastwaypoint, lt, ln);
        addWaypointToMap(n,npos);
        lastwaypoint++;

        //TODO; Make it more robust to add to masterstruct
    }


    function addWaypointToCol(wname, wcolid, wlat, wlng){
        console.log("upd",wlat,wlng)
        var col = document.createElement("tr");
        col.id = wcolid;

        col.innerHTML = "<th><input id="+wname+"-name value = "+wname+"></input></th>\n" +
            "                    <th><input id="+wname+"-col1 value="+wlat+"></input></th>\n" +
            "                    <th><input id="+wname+"-col2 value="+wlng+"></input></th>" +
            "<button type=\"button\" class=\"close\" aria-label=\"Close\" id=\"rmvbutton\" onclick=\"removeWaypoint(\'"+wcolid+"\')\"   " +
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
        console.log(id)
        var elem = document.getElementById(id);

        console.log(id.substring(9,));
        let ind = parseInt(id.substring(9,));
        console.log(listOfMarkers);
        console.log(listOfMarkers[ind]);
        listOfMarkers[ind].setMap(null);
        elem.parentNode.removeChild(elem);
        return false;
        //TODO ADD TO MASTERSTRuCT
    }