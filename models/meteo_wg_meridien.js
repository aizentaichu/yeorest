var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var MeteoWGMeridienSchema = new Schema({
  spot:String,
  current_windspeed:String,
  update_date:String
});

MeteoWGMeridienSchema.index({spot: 1, current_windspeed: 1, update_date: 1}, {unique: true});
mongoose.model('MeteoWGMeridien', MeteoWGMeridienSchema);