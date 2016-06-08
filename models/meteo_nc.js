var mongoose = require('mongoose'),
Schema = mongoose.Schema;

// Main schema
var NcWFMain = new Schema({
  spot:String,
  date:String,
  sysdate:String,
  update_date:String,
  wind_speed_average:String,
  wind_speed_gut:String,
  tide_1_time:String,
  tide_2_time:String,
  tide_3_time:String,
  tide_4_time:String,
  tide_1_value:String,
  tide_2_value:String,
  tide_3_value:String,
  tide_4_value:String  
});

//NcWFMain.index({spot: 1, sysdate:1, wind_speed_average: 1}, {unique: true});

mongoose.model('NcWFMain', NcWFMain);

