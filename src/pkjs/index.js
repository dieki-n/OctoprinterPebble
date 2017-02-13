/* global Pebble, localStorage */

var Clay = require('./clay.js');
var clayConfig = require('./config.js');
var clay = new Clay(clayConfig, null, {autoHandleEvents: false});

var keys = {
  printer_url : 0,
  api_key : 1,
  printer_temp : 2,
  weather_temp : 3
};


Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);
  localStorage.setItem(keys.printer_url, dict.printer_url);
  localStorage.setItem(keys.api_key, dict.octoprint_api);
  localStorage.setItem(keys.printer_temp, dict.printer_temp);
  localStorage.setItem(keys.weather_temp, dict.weather_temp);
  localStorage.setItem(keys.printer_url, dict.printer_url);
});

var WEATHER_API_KEY = "93a9fb28f040a6e1981c9ac44fd2cba2";

Pebble.on('message', function(event){
  var message = event.data;
  if (message.fetch){
    
    var url = "http://" + localStorage.getItem(keys.printer_url) + "/api/job?apikey=" + localStorage.getItem(keys.api_key);
    console.log(url);
    request(url, 'GET', function(respText){
      console.log("Received printer data");
      console.log(respText);
      if (respText == "Invalid API key"){
        Pebble.postMessage({'type':'invalid_api_key'});
        return;
      }
      var printerData = JSON.parse(respText);
      Pebble.postMessage({
        'type'       : 'printerProgress',
        'progress'   : printerData.progress.completion,
        'time_left'  : printerData.progress.printTimeLeft,
        'filename'   : printerData.job.file.name,
        'state'      : printerData.state
      });
    });
    
    url = "http://" + localStorage.getItem(keys.printer_url) + "/api/printer?apikey=" + localStorage.getItem(keys.api_key);
    request(url, 'GET', function(respText){
      if (respText == "Invalid API key"){
        Pebble.postMessage({'type':'invalid_api_key'});
        return;
      }
      console.log("Received printer temp data");
      console.log(respText);
      var printerData = JSON.parse(respText);
      if (localStorage.getItem(keys.printer_temp) == "f"){
           var tool0_temp =  pad(Math.round(printerData.temperature.tool0.actual * 9 / 5 + 32), 3) + "F";
           var bed_temp =  pad(Math.round(printerData.temperature.bed.actual * 9 / 5 + 32), 3) + "F";
        } else {
           var tool0_temp = pad(Math.round(printerData.temperature.tool0.actual), 3) + "C";
           var bed_temp =  pad(Math.round(printerData.temperature.bed.actual), 3) + "C";
        }
      Pebble.postMessage({
        'type'        : 'printerTemp',
        'nozzle_temp' : tool0_temp,
        'bed_temp'    : bed_temp
      });
    });
  } else if (message.fetch_weather){
    navigator.geolocation.getCurrentPosition(function(pos) {
      var url = 'http://api.openweathermap.org/data/2.5/weather' +
              '?lat=' + pos.coords.latitude +
              '&lon=' + pos.coords.longitude +
              '&appid=' + WEATHER_API_KEY;

      request(url, 'GET', function(respText) {
        console.log(respText);
        var weatherData = JSON.parse(respText);
        
        if (localStorage.getItem(keys.weather_temp) == "c"){
           var temp =  Math.round(weatherData.main.temp - 273.15) + "C";
        } else {
           var temp = Math.round((weatherData.main.temp - 273.15) * 9 / 5 + 32) + "F";
        }
        Pebble.postMessage({
            'type'    : 'weather',
            'temp'    : temp,
            'desc'    : weatherData.weather[0].main
          });
        });
    }, function(err) {
      console.error('Error getting location');
    },{ timeout: 15000, maximumAge: 60000 });
  }
});

function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    // HTTP 4xx-5xx are errors:
    if (xhr.status >= 400 && xhr.status < 600) {
      console.error('Request failed with HTTP status ' + xhr.status + ', body: ' + this.responseText);
      if (xhr.status == 401) callback(this.responseText);
      return;
    }
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
}
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}