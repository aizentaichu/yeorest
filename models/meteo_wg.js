var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var MeteoWGSchema = new Schema({
  date:String,
  moment:String,
  hour:String,
  wind:String,
  water_temperature:String,
  city:String,
  update_date:String
});

MeteoWGSchema.index({city: 1, date: 1, moment: 1, update_date: 1}, {unique: true});
mongoose.model('MeteoWG', MeteoWGSchema);