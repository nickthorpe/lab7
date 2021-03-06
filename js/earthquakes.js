/* earthquakes.js
    Script file for the INFO 343 Lab 7 Earthquake plotting page

    SODA data source URL: https://soda.demo.socrata.com/resource/earthquakes.json
    app token (pass as '$$app_token' query string param): Hwu90cjqyFghuAWQgannew7Oi
*/

//create a global variable namespace based on usgs.gov
//this is how JavaScript developers keep global variables
//separate from one another when mixing code from different
//sources on the same page
var gov = gov || {};
gov.usgs = gov.usgs || {};

//base data URL--additional filters may be appended (see optional steps)
//the SODA api supports the cross-origin resource sharing HTTP header
//so we should be able to request this URL from any domain via AJAX without
//having to use the JSONP technique
gov.usgs.quakesUrl = 'https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi';

//current earthquake dataset (array of objects, each representing an earthquake)
gov.usgs.quakes;

//reference to our google map
gov.usgs.quakesMap;
    

//AJAX Error event handler
//just alerts the user of the error
$(document).ajaxError(function(event, jqXHR, err){
    alert('Problem obtaining data: ' + jqXHR.statusText);
});

//function to call when document is ready
$(function(){
    //document is ready for manipulation
    getQuakes();
}); //doc ready


//getQuakes()
//queries the server for the list of recent quakes
//and plots them on a Google map
function getQuakes() {
	$('.message').addClass('loading');
    $.getJSON(gov.usgs.quakesUrl, function(quakes){
    //quakes is an array of objects, each of which represents info about a quake
    //see data returned from:
    //https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi

    //set our global variable to the current set of quakes
    //so we can reference it later in another event
    gov.usgs.quakes = quakes;
    //update paragraph message to let user know how many earthquakes returned
    $( ".message" ).html('Displaying ' + quakes.length + ' earthquakes').removeClass('loading');

    //creating the google map
	gov.usgs.quakesMap = new google.maps.Map($('.map-container')[0], {
	    center: new google.maps.LatLng(0,0),        //centered on 0/0
	    zoom: 2,                                    //zoom level 2
	    mapTypeId: google.maps.MapTypeId.TERRAIN,   //terrain map
	    streetViewControl: false                    //no street view
	});
    //assigning variable to our map
    var map = gov.usgs.quakesMap;
    //calling function to call markers
    addQuakeMarkers(quakes, map);                
}); //handle returned data function

} //getQuakes()

//addQuakeMarkers()
//parameters
// - quakes (array) array of quake data objects
// - map (google.maps.Map) Google map we can add markers to
// no return value
function addQuakeMarkers(quakes, map) {
    
    //loop over the quakes array and add a marker for each quake
    var quake;      //current quake data
    var idx;        //loop counter

    for (idx = 0; idx < quakes.length; ++idx) {
        quake = quakes[idx];

        //latitude of current quake = quake.location.latitude 
        //longitutde of current quake = quake.location.longitude
        //if statement to test for  lat/lng provided on earthquake data
        if (quake.location) {
        	//assuming that the variable 'quake' is set to 
			//the current quake object within the quakes array...
			quake.mapMarker = new google.maps.Marker({
			    'map': map,
			    position: new google.maps.LatLng(quake.location.latitude, quake.location.longitude)
			});
        };
        //create an info window with the quake info (date, magnitude, depth)
        infoWindow = new google.maps.InfoWindow({
			content: new Date(quake.datetime).toLocaleString() + 
            ': magnitude ' + quake.magnitude + ' at depth of ' + 
            quake.depth + ' meters'
		});
        //call closure so we can refer to values of map, marker and infowindow
        registerInfoWindow(map, quake.mapMarker, infoWindow);
    }

    //This function adds a click event handler for the current Marker, and when the handler function 
    //is called, it opens the current InfoWindow, passing a reference to the map and the current Marker. 
    //The event handler function creates a closure so that we can refer to the values of the map, marker, 
    //and infoWindow variables at the time this registerInfoWindow function was called. 
    function registerInfoWindow(map, marker, infoWindow) {
    	//added click handler to open/close info windows 
    	google.maps.event.addListener(marker, 'click', function(){
    		//closes previous info window if there is one
    		 if (gov.usgs.iw) {
                gov.usgs.iw.close(map, this);
            }
            //assign infowindow as a global variable
    		gov.usgs.iw = infoWindow;
    		//open new info window
			infoWindow.open(map, marker);
		});                
	} //registerInfoWindow()

    
} //addQuakeMarkers()