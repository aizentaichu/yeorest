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
	NcWFMain.find({'spot':spot}).sort({'sysdate': -1}).limit(24).exec(function(err, result) {
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

