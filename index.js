VAR_PROXY_URL = "";

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser')

var request = require('request');
var moment = require('moment-timezone');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path');
mongoose = require('mongoose');


mongoUri = 'mongodb://localhost/db_forecast_nc';
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + mongoUri);
});


var app = express();
app.use(cookieParser())


require('./models/meteo_nc');
require('./models/meteo_wg');
require('./models/meteo_wg_meridien');
require('./routes')(app);


app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});



app.listen(3002);
console.log('Listening on port 3002...');
