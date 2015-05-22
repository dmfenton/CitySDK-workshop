/*jslint browser: true*/
/*global L */

var census_variables = ["B17001_004E","B17001_018E"];
var map;
var res;
var sdk = new CitySDK();
var census = sdk.modules.census;
var data_list =[];
var service = { 
  "url": "http://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Education_WebMercator/MapServer/5",
};

census.enable("ba432c7c30a23ed53c9722392673030460bf346b");

var showPop = function (feature, layer) {
	// builds the table for the on-click popups
	var table = document.createElement('table');
	var props = feature.properties;

	var interest = 0;
	Object.keys(props).forEach(function(k){
		if (props[k] !== null){
			var row = table.insertRow();
			var label = row.insertCell(0);
			var value = row.insertCell(1);
			if (census_variables.indexOf(k) > -1){
				console.log(props[k])
				interest += Number(props[k]);
				console.log(interest)
			} else {
				label.innerHTML = k;
				value.innerHTML = props[k];
			}
		}
	});
	feature.properties.disadvantaged_pop = interest;
	var row = table.insertRow();
	var label = row.insertCell(0);
	var value = row.insertCell(1);
	label.innerHTML = "Population Under 5/Income Under Poverty Level"
	value.innerHTML = String(interest);
	layer.bindPopup(table);
};


(function (window, document, L, undefined) {
	'use strict';

	L.Icon.Default.imagePath = 'images/';



	//add the basemap

	map = L.map('map').setView([38.9047, -77.0164], 12);
	L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png', {
	    attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth'
		}).addTo(map);


	var icons = {
	  school: L.icon({
	    iconUrl: 'https://cdn1.iconfinder.com/data/icons/real-estate-set-3/512/3-512.png',
	    iconRetinaUrl: 'https://cdn1.iconfinder.com/data/icons/real-estate-set-3/512/3-512.png',
	    iconSize: [20, 23],
	    iconAnchor: [13.5, 17.5],
	    popupAnchor: [0, -11],
	  })};

	L.esri.featureLayer(service.url, {
	  pointToLayer: function (geojson, latlng) {
	     return L.marker(latlng, {
	       icon: icons.school
	     });
	   },
	 }).addTo(map);
	

	var demographics = L.geoJson(null,
		{onEachFeature: showPop}
		).addTo(map);
	var request = {
		state: "DC",
		level: "tract",
		container: "state",
		sublevel: "true",
		variables: census_variables
	}

	census.GEORequest(request, function(data){
		var myStyle1 = {
		    "color": "red",
		    "weight": 5,
		    "opacity": 0.65
		};
		var myStyle2 = {
		    "color": null,
		    "weight": 0,
		    "opacity": 0.0
		};
		data.features.forEach(function(feature){
			var interest = Number(feature.properties[census_variables[0]]) + Number(feature.properties[census_variables[1]])
			console.log(interest);
			data_list.push(interest);
			if (interest > 100){
				feature.style = myStyle1;
			} else {
				feature.style = myStyle2;
			}
			L.geoJson(feature, {
				style: feature.style
			}).addTo(map);
			//demographics.addData(feature);	
		});
	});

}(window, document, L));