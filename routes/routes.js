module.exports = function(app){
	
	var scrappers = require('../controllers/scrappers.js');
	app.get('/meteo_nc', scrappers.findAll);
	app.get('/meteo_nc/:spot', scrappers.findMeteoNCBySpot);
	app.get('/meteo_nc_import', scrappers.meteo_nc_import);
	app.get('/meteo_wg_import', scrappers.meteo_wg_import);
	app.get('/meteo_wg/:spot', scrappers.findMeteoWGBySpot);
	app.get('/meteo_wg_realtime_meridien', scrappers.getMeteoRtMeridien);
	
}