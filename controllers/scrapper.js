var Scrapper = function () {};

String.prototype.formatFile = function () {
	var accent = [
		/[\300-\306]/g, /[\340-\346]/g, // A, a
		/[\310-\313]/g, /[\350-\353]/g, // E, e
		/[\314-\317]/g, /[\354-\357]/g, // I, i
		/[\322-\330]/g, /[\362-\370]/g, // O, o
		/[\331-\334]/g, /[\371-\374]/g, // U, u
		/[\321]/g, /[\361]/g, // N, n
		/[\307]/g, /[\347]/g, // C, c
	];
	var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

	var str = this;
	if (str != null) {

		for (var i = 0; i < accent.length; i++) {
			str = str.replace(accent[i], noaccent[i]);
			str = str.replace(" ", "_").toLowerCase();
		}

	}
	return str;
}


// JSON menu for meteoNC
Scrapper.prototype.buildMeteoNCMenu = function () {
	
	// Required modules
	var request = require('request');
	var cheerio = require('cheerio');
	var fs = require('fs');
	var path = require('path');


	// Variables definition
	var jsonNavBarArr = [];
	
	console.log("...Requesting : http://www.meteo.nc/nouvelle-caledonie/mer/activites-nautiques?zone=sud")
	var _SERVER = "http://www.meteo.nc/nouvelle-caledonie/mer/activites-nautiques?zone=sud";
	request(_SERVER, function (error, response, html, callback ) {
		sSpotList = html;

		var $spotList = cheerio.load(sSpotList);

		if ($spotList != null) {
			$spotList('.spotIMG').each(function (i, elem) {

				// Loading file sync
				var fs2 = require('fs');
				var spotName = $spotList(this).attr('title');
				var fileContent = null;
				
				//	Json NavBar line 60
				var jsonNavBar = {};
				jsonNavBar.spot = spotName;
				jsonNavBar.url = spotName.formatFile();
				jsonNavBarArr.push(jsonNavBar);					
			});
		}
		
		// Building JSON Navbar file
		console.log("...Writing Navigation bar \t\t navbar-meteo-nc.json");
		var jsonObjNavBar = {
			'navbar_meteonc' : jsonNavBarArr
		};
		var appDir = path.dirname(require.main.filename);
		fs.writeFile(appDir + "\\json\\navbar-meteo-nc.json", JSON.stringify(jsonObjNavBar), function (err) {
			if (err) {
				return console.log(err);
			}
		});
		
	});
	
	
	
}



// Generating content and navigation bar for meteonc data
Scrapper.prototype.importMeteoNc = function () {

	// Importing modules	
	var async = require('async');
	var request = require('request');
	var fs = require('fs');
	var path = require('path');
	var express = require('express');
	var app = express();
	var cheerio = require('cheerio');
	var url = require('url');

	// Init json arrays
	var jsonArr = [];
	var jsonObj = {};
	var aSpot = [];
	var strCookieId;		

		
	async.waterfall([
		
		
		function call_1(callback){

			var _SERVER = "http://www.meteo.nc/nouvelle-caledonie/mer/previsions-site?zone=sud";
			var headers = null;
			var requestCall1 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});
			requestCall1.get(_SERVER, function (error, response, html ) {
				
				
				sSpotList = html;
				
				var sToken = html.match(/url:(.*),/).pop().replace("'/index.php?option=com_ajax&module=mer_previsions&method=getSpot&format=raw&Itemid='+jQuery('#Itemid').html()+'&", "");
				
				//console.log("EXTRACT : " + sToken);
				
				var $spotList = cheerio.load(sSpotList);

				if ($spotList != null) {
					
					$spotList('.spotIMG').each(function (i, elem) {
						var spotName = $spotList(this).attr('title');					
						var _SERVER_CHILD = "http://www.meteo.nc/index.php?option=com_ajax&module=mer_previsions&method=getSpot&format=raw&Itemid=428&" + sToken + "&spot=";
						var _SERVER_CHILD_URL = _SERVER_CHILD + encodeURIComponent(spotName) + "&zone=sud";
						var jSpot = {};
						jSpot.name = spotName;
						jSpot.url = _SERVER_CHILD_URL;
						aSpot.push(jSpot, headers);	
						
					});

					
					callback();			
					
				}
	
			});

		},
		function call_2(callback){

			for(var iSpot=0;iSpot<aSpot.length;iSpot++){
						
				
						
				var requestCall2 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});
				if(aSpot[iSpot] != null){
					var spotName = aSpot[iSpot].name;
					
					console.log("...Scrapping : " + spotName);

					requestCall2(aSpot[iSpot].url , function (error, response, html, request) {
						
						if (!error && response.statusCode == 200) {
							
							var aPath = this.path.split("&")
							spotName = decodeURI(aPath[aPath.length-2]).replace("spot=","");
							
							dbFillMeteoNC(html, spotName);
							callback();
						}
			
					});
				}
			}
	
			
		}

		],
		// optional callback
		function(err){
			
			if(err){
				console.log('Error in MongoDB update > call_2');
			}else{
				console.log("MongoDB updated...");
			}
			
		}
	);
		
};

/*
 From HTML DATA to MONGO JSON
 For METEONC only
*/
function dbFillMeteoNC(fileContent, spotName){

	var mongoose = require('mongoose');
	var cheerio = require('cheerio');
	var moment = require('moment-timezone');
	moment().format();
	moment.locale('en-EN');
	moment().utcOffset(11);
	var now = moment();	
	
	
	// Parsing HTML File
	if (fileContent != null) {

		// Parsing JSON result...extracting data between tags, then evaluate JSON to JS objects
		var $ = cheerio.load(fileContent);
		var sScriptContent = $('script').text();
		sScriptContent = sScriptContent.replace("setGraph(ObjectVent, SeriesVent);setGraph(ObjectHoule, SeriesHoule);","");
		eval(sScriptContent);

		
		// Wind data
		var aWindSpeedGut = new Array();
		var aWindSpeedAverage = new Array();
		
		for(iSeriesVent=0;iSeriesVent<2;iSeriesVent++){
			
			for(iWindData=0;iWindData<SeriesVent[iSeriesVent].data.length; iWindData++){
				
				var timestamp = SeriesVent[iSeriesVent].data[iWindData][0];

				switch(iSeriesVent){
					case 0:

						var windSpeedGut = SeriesVent[iSeriesVent].data[iWindData][1];
							
						//if(windSpeedGut != null && windSpeedGut != ""){						
							aWindSpeedGut[timestamp] = windSpeedGut;
						//}
					break;
					case 1:

						var windSpeedAverage = SeriesVent[iSeriesVent].data[iWindData][1];	

						//if(windSpeedAverage != null && windSpeedAverage != ""){						
							aWindSpeedAverage[timestamp] = windSpeedAverage;
						//}
					break;
					case 2:
					
					break;
				}
			

				

			}
		}
		
		
		// Main data
		for (var key in shom) {
			if (shom.hasOwnProperty(key)) {
				
				var val = shom[key];
				var now = moment();		
				
				var jsonToInsert = {
					spot:spotName,
					date:"",
					sysdate:key,
					update_date:now.unix(),
					tide_1_time:Object.keys(val)[0],
					tide_2_time:Object.keys(val)[1],
					tide_3_time:Object.keys(val)[2],
					tide_4_time:Object.keys(val)[3],
					tide_1_value:val[Object.keys(val)[0]],
					tide_2_value:val[Object.keys(val)[1]],
					tide_3_value:val[Object.keys(val)[2]],
					tide_4_value:val[Object.keys(val)[3]],
					wind_speed_average:aWindSpeedAverage[key],
					wind_speed_gut:aWindSpeedGut[key]
				};
			
				// Inserting main data in MongoDB
				MeteoNC = mongoose.model('NcWFMain');
				MeteoNC.create(jsonToInsert);
						
			}
			
		}
	
	}

}

// Generating content and navigation bar for Windguru
Scrapper.prototype.parseSpotWindGuru = function () {

	// Importing modules
	var fs = require('fs');
	var cheerio = require('cheerio');
	var path = require('path');
	var request = require('request');

	var monthNames = [
		"Janvier", "Février", "Mars",
		"Avril", "Mai", "Juin", "Juillet",
		"Août", "Septembre", "Octobre",
		"Novembre", "Decembre"
	];

	var aWgSpotList = {
		"spot_list" : [{
				id : "4164",
				spot : "Nouméa"
			}, {
				id : "6470",
				spot : "Poe beach"
			}, {
				id : "208755",
				spot : "Anse Vata"
			}, {
				id : "208759",
				spot : "Ilôt Goeland"
			}, {
				id : "208762",
				spot : "Ouano"
			}, {
				id : "208767",
				spot : "Mou"
			}, {
				id : "91442",
				spot : "Meridien Nouméa"
			}, {
				id : "508849",
				spot : "Ouen Toro Sainte Marie"
			}, {
				id : "208764",
				spot : "Easo"
			}, {
				id : "6476",
				spot : "Ilôt Ténia"
			}, {
				id : "208766",
				spot : "Baie de Chateaubriand"
			}

		]
	};

	//	Json NavBar
	var jsonNavBarArr = [];
	var jsonNavBar = {};

	// ...Traversing through spot items
	for (var i = 0; i < aWgSpotList.spot_list.length; i++) {

		// Init variables
		sSpotName = aWgSpotList.spot_list[i].spot;
		sSpotId = aWgSpotList.spot_list[i].id;

		var fs2 = require('fs');
		var fileToCheck = "scrapper_data/getWindguruSpot.html";

		request('http://www.windguru.cz/fr/index.php?sc=' + sSpotId + '&sty=m_spot', function (error, response, html, sSpotId) {
		//request('http://localhost:666/meteo-data/getWindguruSpot.html', function (error, response, html, sSpotId) {
			if (!error && response.statusCode == 200) {


			
				fileContent = html;

				// Parsing HTML File
				if (fileContent != null) {

					var $sWgContent = cheerio.load(fileContent);
					var sWgJson = $sWgContent(".fcsttabf script").text().trim();

					sWgJson = sWgJson.replace("wgopts_1.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_1,wgopts_1);");
					sWgJson = sWgJson.replace("wgopts_2.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_2,wgopts_2);");

					// Using Wg Json object from webpage...
					eval(sWgJson);

					var aWgJsonData = [];
					var iMoments = 1;
					var iDaysForecast = 0;

					for (var iTpt = 0; iTpt < wg_fcst_tab_data_1.fcst["3"].TMP.length; iTpt++) {

						var sTemperature = wg_fcst_tab_data_1.fcst["3"].TMP[iTpt];
						var sWindSpeed = wg_fcst_tab_data_1.fcst["3"].WINDSPD[iTpt];
						var sDay = wg_fcst_tab_data_1.fcst["3"].hr_d[iTpt];
						var sHour = wg_fcst_tab_data_1.fcst["3"].hr_h[iTpt];
						var sWgJsonData = {};

						// Moments
						if (iMoments <= 3) {
							sMoment = "Matin";
						}
						if (iMoments > 3 && iMoments <= 6) {
							sMoment = "Apres-midi";
							if (iMoments == 6) {
								iMoments = 0;
							}
						}
						iMoments++;

						// Date
						if (iTpt % 8 == 0) {
							iDaysForecast++;
						}
						var wgDate = new Date();
						wgDate.setDate(wgDate.getDate() + iDaysForecast);
						var day = wgDate.getDate();
						var monthIndex = wgDate.getMonth();
						var year = wgDate.getFullYear();

						// Filling wg json
						sWgJsonData.date = day + ' ' + monthNames[monthIndex] + ' ' + year;
						sWgJsonData.moment = sMoment;
						sWgJsonData.hour = sHour;
						sWgJsonData.wind = sWindSpeed.toString();
						sWgJsonData.water_temperature = sTemperature.toString();
						sWgJsonData.city = wg_fcst_tab_data_1.spot.toString();

						aWgJsonData.push(sWgJsonData);
					}

					//	Json NavBar
					var jsonNavBar = {};
					jsonNavBar.spot = wg_fcst_tab_data_1.spot;
					jsonNavBar.url = wg_fcst_tab_data_1.spot.replace("New Caledonia - ", "").formatFile();
					jsonNavBarArr.push(jsonNavBar);

					// Building JSON Navbar file
					var jsFileToGenerate = wg_fcst_tab_data_1.spot.replace("New Caledonia - ", "").formatFile();
					console.log("...Writing WG Data \t\t json/meteo-wg-" + jsFileToGenerate + ".json");
					var sWgJsonDataFile = {
						'forecast_windguru' : aWgJsonData
					};
					return JSON.stringify(sWgJsonDataFile);
					/*
					fs.writeFile(__dirname + "\\app\\json\\meteo-wg-" + jsFileToGenerate + ".json", JSON.stringify(sWgJsonDataFile), function (err) {
						if (err) {
							return console.log(err);
						}
					});
					*/

				}

	// Building JSON Navbar file
	console.log("...Writing Navigation bar \t\t json/navbar-meteo-wg.json");
	var jsonObjNavBar = {
		'navbar_wg' : jsonNavBarArr
	};
	fs.writeFile(__dirname + "\\app\\json\\navbar-meteo-wg.json", JSON.stringify(jsonObjNavBar), function (err) {
		if (err) {
			return console.log(err);
		}
	});


			}
		});


	}
	return true;
}


// Generating content and navigation bar for meteonc data
Scrapper.prototype.importMeteoWG = function () {

	console.log('importMeteoWG');
	
	// Importing modules
	var fs = require('fs');
	var cheerio = require('cheerio');
	var path = require('path');
	var request = require('request');

	var monthNames = [
		"Janvier", "Février", "Mars",
		"Avril", "Mai", "Juin", "Juillet",
		"Août", "Septembre", "Octobre",
		"Novembre", "Decembre"
	];

	var aWgSpotList = {
		"spot_list" : [{
				id : "4164",
				spot : "Nouméa"
			}, {
				id : "6470",
				spot : "Poe beach"
			}, {
				id : "208755",
				spot : "Anse Vata"
			}, {
				id : "208759",
				spot : "Ilôt Goeland"
			}, {
				id : "208762",
				spot : "Ouano"
			}, {
				id : "208767",
				spot : "Mou"
			}, {
				id : "91442",
				spot : "Meridien Nouméa"
			}, {
				id : "508849",
				spot : "Ouen Toro Sainte Marie"
			}, {
				id : "208764",
				spot : "Easo"
			}, {
				id : "6476",
				spot : "Ilôt Ténia"
			}, {
				id : "208766",
				spot : "Baie de Chateaubriand"
			}

		]
	};

		
		
	
	//	Json NavBar
	var jsonNavBarArr = [];
	var jsonNavBar = {};

	// ...Traversing through spot items
	for (var i = 0; i < aWgSpotList.spot_list.length; i++) {

		// Init variables
		sSpotName = aWgSpotList.spot_list[i].spot;
		sSpotId = aWgSpotList.spot_list[i].id;

		var fs2 = require('fs');
		var fileToCheck = "scrapper_data/getWindguruSpot.html";
		console.log('http://www.windguru.cz/fr/index.php?sc=' + sSpotId + '&sty=m_spot');
		
		var requestCall1 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});
		requestCall1('http://www.windguru.cz/fr/index.php?sc=' + sSpotId + '&sty=m_spot', function (error, response, html, sSpotId) {

			if (!error && response.statusCode == 200) {
			
				fileContent = html;

				// Parsing HTML File
				if (fileContent != null) {

					var $sWgContent = cheerio.load(fileContent);
					var sWgJson = $sWgContent(".fcsttabf script").text().trim();

					sWgJson = sWgJson.replace("wgopts_1.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_1,wgopts_1);");
					sWgJson = sWgJson.replace("wgopts_2.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_2,wgopts_2);");

					// Using Wg Json object from webpage...
					eval(sWgJson);
					
					var moment = require('moment-timezone');
					moment().format();
					moment.locale('en-EN');
					moment().utcOffset(11);
					
					// Wed, 13 Jan 2016 04:51:39
					var sUpdateDate = wg_fcst_tab_data_1.fcst["3"].update_last.trim(); 
					var m = moment(sUpdateDate, "ddd, DD MMM YYYY HH:mm:ss +SSSS");
					sUpdateDate = m.unix();
					
					
					var aWgJsonData = [];
					var iMoments = 1;
					var iDaysForecast = 0;

					for (var iTpt = 0; iTpt < wg_fcst_tab_data_1.fcst["3"].TMP.length; iTpt++) {

						var sTemperature = wg_fcst_tab_data_1.fcst["3"].TMP[iTpt];
						var sWindSpeed = wg_fcst_tab_data_1.fcst["3"].WINDSPD[iTpt];
						var sDay = wg_fcst_tab_data_1.fcst["3"].hr_d[iTpt];
						var sHour = wg_fcst_tab_data_1.fcst["3"].hr_h[iTpt];


						var sWgJsonData = {};

						// Moments
						if (iMoments <= 3) {
							sMoment = "Matin";
						}
						if (iMoments > 3 && iMoments <= 6) {
							sMoment = "Apres-midi";
							if (iMoments == 6) {
								iMoments = 0;
							}
						}
						iMoments++;

						// Date
						if (iTpt % 8 == 0) {
							iDaysForecast++;
						}
						var wgDate = new Date();
						wgDate.setDate(wgDate.getDate() + iDaysForecast);
						var day = wgDate.getDate();
						var monthIndex = wgDate.getMonth();
						var year = wgDate.getFullYear();

						// Filling wg json
						sWgJsonData.date = day + ' ' + monthNames[monthIndex] + ' ' + year;
						sWgJsonData.moment = sMoment;
						sWgJsonData.hour = sHour;
						sWgJsonData.wind = sWindSpeed.toString();
						sWgJsonData.water_temperature = sTemperature.toString();
						sWgJsonData.city = wg_fcst_tab_data_1.spot.toString();
						sWgJsonData.update_date = sUpdateDate;

						aWgJsonData.push(sWgJsonData);
						
						// Inserting data in MongoDB
						var mongoose = require('mongoose');
						MeteoWG = mongoose.model('MeteoWG');
						MeteoWG.create(sWgJsonData);

					}


				}


			}
		});


	}

}

// Generating content and navigation bar for meteonc data
Scrapper.prototype.getMeteoWGRtMeridien = function () {
	
}

// https://www.windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station=99&hours=100&avg_minutes=10&back_hours=100&graph_info=1&_=1450734033114
// Generating content and navigation bar for meteonc data
Scrapper.prototype.parseWgMeridienSpot____ = function (idStation, hours, avgMinutes, backHours) {
	
	var request = require('request');
	var moment = require('moment-timezone');


	backHours = 0;
	//var _SERVER = "http://localhost:666/meteo-data/wg-data-realtime.js";
	var _SERVER = "https://www.windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station="+ idStation +"&hours="+ hours +"&avg_minutes="+ avgMinutes +"&back_hours="+ backHours +"&graph_info=1&_=1450734033114";
	var requestCall1 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});
	requestCall1(_SERVER, function (error, response, html) {
	
		if (!error && response.statusCode == 200) {
			
			// Building jsVARIABLE from WG SPOT
			eval(" var jSonResponse = (" + html + ");");
			
			var jSonWgRealTimeArr = [];

			
			for(iJson=0;iJson<jSonResponse.datetime.length;iJson++){
				
				// Initialize variables
				var sDateTime = jSonResponse.datetime[iJson];
				var sUnixTime = (jSonResponse.unixtime[iJson]*1000)+39600000;
				
				var sWindAvg = jSonResponse.wind_avg[iJson];
				var sWindMax = jSonResponse.wind_max[iJson];
				var sWindMin = jSonResponse.wind_min[iJson];
				var sWindDirection = jSonResponse.wind_direction[iJson];
				var sGustiness = jSonResponse.gustiness[iJson];		
				
				var aData = [sUnixTime, sWindMin, sWindMax];
				jSonWgRealTimeArr.push(aData);
				
			}
			var sStartStamp = jSonResponse.startstamp;
			var sEndStamp = jSonResponse.startstamp;

			var currentdate = new Date(); 
			var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
			
			console.log(datetime);
				
			/*
			console.log("...Writing Content File \t\t wg-meridien-realtime.json");
			var fs = require('fs');
			fs.writeFile(__dirname + "\\app\\json\\wg-meridien-realtime.json", JSON.stringify(jSonWgRealTimeArr), function (err) {
				if (err) {
					return console.log(err);
				}
			});			
			*/
			return JSON.stringify(jSonWgRealTimeArr);
			
		}
	});

}


Scrapper.prototype.parseWgMeridienSpot = function () {
	
	var async = require('async');
	var jsonObj = {};
	var sWindAvg;
	
	async.waterfall([
		

		function call_1(callback){

			var request = require('request');
			var moment = require('moment-timezone');
			backHours = 0;
			
			var requestCall0 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});
			requestCall0.get("https://beta.windguru.cz/station/99", function (error, response, html ) {
				console.log("Call zero : https://beta.windguru.cz/station/99");
			});

			var _SERVER = "https://windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station=99&hours=1&avg_minutes=0.5&back_hours=0&graph_info=1&_=1450734033114";
			var requestCall1 = request.defaults({'proxy': VAR_PROXY_URL, jar: true});		
			requestCall1.get(_SERVER, function (error, response, html ) {

			
				if (!error && response.statusCode == 200) {
					
					console.log(html);
					
					// Building jsVARIABLE from WG SPOT
					eval(" var jSonResponse = (" + html + ");");
					
					var jSonWgRealTimeArr = [];
					console.log(html);
					//var sWindMax = jSonResponse.wind_max[jSonResponse.wind_max.length-1];
					if(jSonResponse.wind_avg != null){
						sWindAvg = jSonResponse.wind_avg[jSonResponse.wind_avg.length-1];
					}
		
					callback(null);
				}
			});	
			
		},
		function call_2(callback){
			
			
			var currentdate = new Date(); 
			var datetime = "parseWgMeridienSpot // Wind : " + sWindAvg + " Last Sync: " + currentdate.getDate() + "/"
			+ (currentdate.getMonth()+1)  + "/" 
			+ currentdate.getFullYear() + " @ "  
			+ currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
			
			var moment = require('moment-timezone');
			moment().format();
			moment.locale('en-EN');
			moment().utcOffset(11);
			var now = moment();	
			
			console.log(datetime);
			
			// Building JSON Content file
			jsonObj.spot = "Méridien";
			jsonObj.current_windspeed = sWindAvg;
			jsonObj.update_date = now.unix();
			
			callback(null,jsonObj);
		}

		],
		// optional callback
		function(err, res){

			if(err){
				console.log('Error in ImportMeteoNC > call_2');
			}else{
				
				// Inserting realtime forecast data into MongoDB
				var mongoose = require('mongoose');
				MeteoWGMeridien = mongoose.model('MeteoWGMeridien');
				MeteoWGMeridien.create(res);
				
			}
			
		}
	);	
	
}



exports.Scrapper = Scrapper;