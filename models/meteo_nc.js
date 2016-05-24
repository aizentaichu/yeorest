var mongoose = require('mongoose'),
Schema = mongoose.Schema;

// Main schema
var NcWFMain = new Schema({
  spot:String,
  date:String,
  sysdate:String,
  update_date:String
});


// Windsoeed average
var NcWFWindSpeedAverage = new Schema({
  sysdate:String,
  wind_speed_average:String
});

// Windsoeed gut
var NcWFWindSpeedGut = new Schema({
  sysdate:String,
  wind_speed_gut:String
});

// Tides
var NcWFTides = new Schema({
  sysdate:String,
  tide_1_time:String,
  tide_2_time:String,
  tide_3_time:String,
  tide_4_time:String,
  tide_1_value:String,
  tide_2_value:String,
  tide_3_value:String,
  tide_4_value:String  
});


//NcWFMain.index({spot: 1, sysdate: 1}, {unique: true});
mongoose.model('NcWFWindSpeedGut', NcWFWindSpeedGut);
mongoose.model('NcWFWindSpeedAverage', NcWFWindSpeedAverage);
mongoose.model('NcWFTides', NcWFTides);
mongoose.model('NcWFMain', NcWFMain);

