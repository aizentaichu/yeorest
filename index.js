VAR_PROXY_URL = "";
global.WgLang = {"legend":{"SMER":"Direction du vent","TMP":"Temp\u00e9rature","WINDSPD":"Vitesse du vent","MWINDSPD":"Vent modifi\u00e9","APCP":"Pluie (mm\/3h)","TCDC":"Couverture nuageuse (%)","HTSGW":"Vagues","WAVESMER":"Direction des vagues","RATING":"Note Windguru","PERPW":"P\u00e9riode des vagues (s)","APCP1":"Pluie (mm\/1h)","GUST":"Rafales","SLP":"<span class=\"helpinfhpa\">*Pression (hPa)<\/span>","RH":"Humidit\u00e9 (%)","FLHGT":"<span class=\"helpinffl\">*Isotherme 0\u00b0 (m)<\/span>","CDC":"Couverture nuageuse (%)<br\/>haute \/ moyenne \/ basse","TMPE":"<span class=\"helpinftmp\">*Temp\u00e9rature <\/span>","WCHILL":"Refroidissement \u00e9olien","APCPs":"<span class=\"helpinfsnow\">*Precip. (mm\/3h)<\/span>","APCP1s":"<span class=\"helpinfsnow\">*Precip. (mm\/1h)<\/span>","WVHGT":"Mer du vent","WVPER":"P\u00e9riode (s)","WVDIR":"Direction","SWELL1":"Houle","SWPER1":"P\u00e9riode (s)","SWDIR1":"Direction","SWELL2":"2. Houle","SWPER2":"2. P\u00e9riode (s)","SWDIR2":"2. Direction","DIRPW":"Direction des vagues","WAVEDIR":"Direction des vagues"},"tooltip":{"TMPE":"Temp\u00e9rature \u00e0 2 m\u00e8tres du sol, corrig\u00e9e en fonction de l'altitude r\u00e9elle du spot. Plus d'information dans la section Aide\/FAQ.","SLP":"Pression au niveau de la mer en hPa, ajouter <b>10<\/b>00 aux valeurs faibles","FLHGT":"Niveau de cong\u00e9lation en m\u00e8tres","sst":"Temp\u00e9rature de l'eau en surface d'apr\u00e8s des donn\u00e9es satellite. Valide pour les oc\u00e9ans et grands lacs, pour plus d'information voir l'aide\/FAQ.","APCP1s":"Pr\u00e9cipitations en millim\u00e8tres. La neige est indiqu\u00e9e par un nombre bleu et gras.","APCPs":"Pr\u00e9cipitations en millim\u00e8tres. La neige est indiqu\u00e9e par un nombre bleu et gras."},"dir":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"],"weekday":["Di","Lu","Ma","Me","Je","Ve","Sa"],"txt":{"archive":"Archives","tides":"Mar\u00e9es","detail":"D\u00e9tails \/ Carte","link":"Lien direct","timezone":"Fuseau horaire","help":"Aide","options":"Options","choose_m":"S\u00e9lectionnez une modification de vent","loading":"Chargement en cours...","delayed":"Pr\u00e9visions 12 heures apr\u00e8s. Les derni\u00e8res pr\u00e9visions MM5\/WRF ne sont disponibles que pour les abonn\u00e9s Windguru PRO. <a href='help_index.php?sec=pro'>Cliquez pour plus d'info.<\/a>","delayed_short":"Pr\u00e9visions 12 heures apr\u00e8s. Les derni\u00e8res pr\u00e9visions MM5\/WRF ne sont disponibles que pour les abonn\u00e9s Windguru PRO.","custom_onlypro":"Les pr\u00e9visions MM5\/WRF pour les spots personnels sont disponibles uniquement pour les utilisateurs de Windguru PRO","lastupdated":"Derni\u00e8re mise \u00e0 jour","nextexpected":"Prochaine mise \u00e0 jour pr\u00e9vue \u00e0","timeleft":"Temps restant"},"tab":{"forecast":"Pr\u00e9vision","graph":"<img src=\"\/images\/gricon.png\" width=\"15\" height=\"10\"\/>","2d":"2D","2d_t":"Temp. (0 ... 5000 m)","2d_w":"Vent (0 ... 5000 m)","2d_t_l":"Temp. (alt ... +2000 m)","2d_w_l":"Vent (alt ... +2000 m)","map":"Carte","webcams":"Webcams","reports":"Observations","accommodation":"H\u00e9bergements","schools":"\u00c9coles\/location","shops":"Boutiques","other":"Autres...","directory":"Links","fcst_graph":"<img src=\"\/img\/gricon.png\"\/>","more":"<span class=\"butt-txt\">Voir plus...<\/span>","statistic":"Statistiques","archive":"Archive"},"units":{"kmh":"km\/h","mph":"mph","ms":"m\/s","msd":"m\/s","knots":"noeuds","bft":"Bft","c":"&deg;C","f":"&deg;F","m":"m","ft":"ft"},"maps":{"windspd":"Wind","t2m":"Temp\u00e9rature","press":"Pression","tcdc_apcp3":"Rain \/ clouds","tcdc_apcp1":"Rain \/ clouds"},"mapsi":{"windspd":"wind","t2m":"temperature","press":"pressure","tcdc_apcp3":"precipitation","tcdc_apcp1":"precipitation"},"gmap":{"link_f":"Pr\u00e9visions","link_a":"Archives","link_d":"D\u00e9tails","link_add":"Ajouter aux favoris","link_s":"Choisir"},"spotmenu":{"sel_zeme":"CHOISIR UN PAYS","sel_spot":"CHOISIR UN SPOT","num_spot":"spots","num_reg":"r\u00e9gions","num_zeme":"pays","sel_all":"TOUT","qs_hint":"Type spot name (min. 3 characters)"},"langdir":{"dir":"fr"}};
global.request = require('request');
global.cheerio = require('cheerio');

var express = require('express');
var cookieParser = require('cookie-parser')



mongoose = require('mongoose');
var db = require('./config/database.js');
mongoose.connect(db.url);

var app = express();
app.use(cookieParser())

require('./models/meteo_nc');
require('./models/meteo_wg');
require('./models/meteo_wg_meridien');
require('./routes/routes')(app);


app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});

var iPortNumber = 3003
app.listen(iPortNumber);
console.log('Listening on port ' + iPortNumber + '...');
