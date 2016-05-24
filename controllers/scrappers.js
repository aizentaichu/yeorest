var async = require('async');
var mongoose = require('mongoose');
NcWFMain = mongoose.model('NcWFMain');
MeteoWG = mongoose.model('MeteoWG');
MeteoWGMeridien = mongoose.model('MeteoWGMeridien');

var Scrapper = require('./scrapper.js').Scrapper;
var scrapper = new Scrapper();

exports.findAll = function(req, res){

	var spot = req.params.spot;

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");

	NcWFMain.find({'spot':spot},function(err, results) {
    return res.send(results);
  });
};

exports.add = function() {};

exports.update = function() {};

exports.delete = function() {};

// Importing data from www.meteo.nc website
exports.meteo_nc_import = function(req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");

	scrapper.importMeteoNc();
	
	res.send("Import completed...");
};


// List of last 12 forecast for a choosen spot
exports.findMeteoNCBySpot = function(req, res){

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
	
	var spot = req.params.spot;
	NcWFMain.find({'spot':spot}).sort({'sysdate': -1}).limit(12).exec(function(err, result) {
		jsonForecastNcWFMain = {"forecast_meteonc" : result};
		return res.send(jsonForecastNcWFMain);
	});

};


// List of last 12 forecast for a choosen spot
exports.findMeteoWGBySpot = function(req, res){

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
	
	var spot = req.params.spot;

	MeteoWG.find({'city':spot}).sort({'update_date': -1}).limit(53).exec(function(err, result) {
		
		jsonForecastMeteoWG = {"forecast_windguru" : result};
		return res.send(jsonForecastMeteoWG);
	});

};



// Importing data from www.windguru.cz website
exports.meteo_wg_import = function(req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");

	scrapper.importMeteoWG();
	
	res.send("Import completed...");
};


// Importing data from www.windguru.cz website
exports.getMeteoRtMeridien = function(req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");

	// Parse and insert vent.nc data
	scrapper.parseWgMeridienSpot();
	
	// Getting previously inserted data
	MeteoWGMeridien.find({'spot':'Méridien'}).sort({'update_date': -1}).limit(1).exec(function(err, result) {
		return res.send(result[0]);
	});


};



/*
scrapper.parseWgMeridienSpot(99, 600, 120, 24);
scrapper.parseSpotMeteoNc();

var Scrapper = require('./scrapper.js').Scrapper;
var scrapper = new Scrapper();
scrapper.buildMeteoNCMenu();
console.log(scrapper.parseSpotMeteoNc("Poe"));

exports.getWgMeridienSpot = function(req, res) {
		
	scrapper.parseWgMeridienSpot(99, 600, 120, 24);
	res.send("MERDIEN");	
};

exports.getSpotWindGuru = function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");

	scrapper.parseSpotWindGuru();
	jsonVar = {"forecast_meteonc":[{"spot":"Anse Vata","date":"Mercredi 11 novembre","sysdate":"","moment":"Matin","wind":"6","water_temperature":"23","tide_time_1":"01h30","tide_time_2":"07h56","tide_1":"0.36","tide_2":"1.49","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Mercredi 11 novembre","sysdate":"","moment":"Après-midi","wind":"10","water_temperature":"23","tide_time_1":"13h56","tide_time_2":"19h45","tide_1":"0.57","tide_2":"1.43","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Jeudi 12 novembre","sysdate":"","moment":"Matin","wind":"12","water_temperature":"23","tide_time_1":"02h02","tide_time_2":"08h30","tide_1":"0.31","tide_2":"1.53","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Jeudi 12 novembre","moment":"Après-midi","wind":"16","water_temperature":"23","tide_time_1":"14h32","tide_time_2":"20h19","tide_1":"0.56","tide_2":"1.43","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Vendredi 13 novembre","moment":"Matin","wind":"12","water_temperature":"23","tide_time_1":"02h33","tide_time_2":"09h03","tide_1":"0.28","tide_2":"1.55","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Vendredi 13 novembre","moment":"Après-midi","wind":"16","water_temperature":"23","tide_time_1":"15h09","tide_time_2":"20h53","tide_1":"0.57","tide_2":"1.41","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Samedi 14 novembre","sysdate":"","moment":"Matin","wind":"12","water_temperature":"23","tide_time_1":"03h05","tide_time_2":"09h38","tide_1":"0.27","tide_2":"1.57","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Samedi 14 novembre","sysdate":"","moment":"Après-midi","wind":"16","water_temperature":"23","tide_time_1":"15h46","tide_time_2":"21h27","tide_1":"0.59","tide_2":"1.39","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Dimanche 15 novembre","sysdate":"","moment":"Matin","wind":"12","water_temperature":"23","tide_time_1":"03h39","tide_time_2":"10h14","tide_1":"0.29","tide_2":"1.55","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Dimanche 15 novembre","moment":"Après-midi","wind":"14","water_temperature":"23","tide_time_1":"16h26","tide_time_2":"22h04","tide_1":"0.61","tide_2":"1.35","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Lundi 16 novembre","moment":"Matin","wind":"14","water_temperature":"23","tide_time_1":"04h15","tide_time_2":"10h54","tide_1":"0.32","tide_2":"1.53","tide_time_sys_1":""},
{"spot":"Anse Vata","date":"Lundi 16 novembre","moment":"Après-midi","wind":"16","water_temperature":"23","tide_time_1":"17h09","tide_time_2":"22h45","tide_1":"0.65","tide_2":"1.29","tide_time_sys_1":""}]};
	res.send(jsonVar);	

};

exports.getSpotMeteoNc  = function(req, res) {
	
	var spotname = req.params.spotname;
	var jsonVar	= scrapper.parseSpotMeteoNc(spotname);
	console.log(scrapper.parseSpotMeteoNc(spotname));
	res.send(JSON.stringify(jsonVar));	
	
};

exports.getCurrMeteoNCWindspeed  = function(req, res) {
				
	res.send([{
	"function": "getCurrMeteoNCWindspeed"
	}]);	

};
*/