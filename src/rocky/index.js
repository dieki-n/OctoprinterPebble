var rocky = require('rocky');
var stored_data = {"progress"      : 0,
                   "time_left"     : 0,
                   "bed_temp"      : 0,
                   "nozzle_temp"   : 0,
                   "printer_state" : 0,
                   "weather_temp"  : 0,
                   "weather_desc"  : "",
                   "weather_init"  : false,
                   "init"          : false,
                   "error"         : 0};
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var g_timeout = 0;
rocky.on('draw', function(event) {
  var ctx = event.context;
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;
  var d = new Date();
  ctx.fillStyle = "#000055";
  ctx.fillRect(0,0,144,168);
  ctx.strokeStyle = "#00AA55";
  
  ctx.beginPath();
  //Draw the hex background
  var hex_width = 12;
  var hex_height = 10;
  for (var y = 0; y < 168 / hex_height; y++){
    for (var x = 0; x < 160 / hex_width; x++){
      ctx.moveTo(x * hex_width + (y % 2) * (hex_width / 2), y * hex_height);
      ctx.lineTo(x * hex_width + (y % 2) * (hex_width / 2), (y + 0.5) * hex_height);
      ctx.lineTo(x * hex_width - (hex_width / 2)  + (y % 2) * (hex_width / 2), (y + 1) * hex_height);
      ctx.moveTo(x * hex_width  + (y % 2) * (hex_width / 2), (y + 0.5) * hex_height);
      ctx.lineTo(x * hex_width + (hex_width / 2)  + (y % 2) * (hex_width / 2), (y + 1) * hex_height);
    }
    ctx.stroke();
    ctx.beginPath();
  }
  
  //Calculate the width of the time, so we can position the AM/PM correctly
  ctx.font = '42px bold Bitham';
  ctx.textAlign = 'center';
  var time_string = ((d.getHours() + 11) % 12 + 1) + ":" + pad(d.getMinutes(), 2);
  var time_width = ctx.measureText(time_string).width;
  var date_weather_string = months[d.getMonth()] + " " + d.getDate();
  if (stored_data.weather_init){
    date_weather_string += "  " + stored_data.weather_temp + " " + stored_data.weather_desc;
  }
  
  //Draw the lower background, and the time
  ctx.fillStyle = "#AAAAAA";
  if (stored_data.printer_state == "Printing" || stored_data.printer_state == "Paused"){
    ctx.fillRect(0, 93, w, 168 - 93);  
    
    ctx.fillStyle = 'white';
    ctx.fillText(time_string, w / 2 - 11, 15, w);
    
    ctx.font = '24px bold Gothic';
    ctx.textAlign = 'left';
    ctx.fillText(d.getHours() > 12 ? "PM" : "AM", w / 2 - 11 + (time_width / 2) + 3, 32, w);
    
    ctx.font = '18px bold Gothic';
    ctx.fillText(date_weather_string, w / 2 - 11 - (time_width / 2), 55, w);
  } else {
    ctx.fillRect(0, 140, w, 168 - 140);  
    
    ctx.fillStyle = 'white';
    ctx.fillText(time_string, w / 2 - 11, 40, w);
    
    ctx.textAlign = 'left';
    ctx.font = '24px bold Gothic';
    ctx.fillText(d.getHours() > 12 ? "PM" : "AM", w / 2 - 11 + (time_width / 2) + 3, 57, w);
    
    ctx.font = '18px bold Gothic';
    ctx.fillText(date_weather_string, w / 2 - 11 - time_width / 2, 80, w);  
  }
  
  
  
  if (stored_data.init === true){
    g_timeout = 0;
    if (stored_data.printer_state == "Printing" || stored_data.printer_state == "Paused"){
      //We are printing!
      drawProgressBar(11, 104, 124, 20, stored_data.progress, ctx);
      ctx.font = '14px bold Gothic';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      var time_left_string = Math.floor(stored_data.time_left / 3600) + "h " + Math.floor(stored_data.time_left % 3600 / 60) + "m";
      var dim = ctx.measureText(time_left_string);
      ctx.beginPath();
      ctx.moveTo(10, 124);
      ctx.lineTo(10, 140);
      ctx.lineTo(10 + dim.width + 10, 140);
      ctx.lineTo(10 + dim.width + 10 + 10, 124);
      ctx.lineTo(10, 124);
      ctx.closePath();
      ctx.fill();
      
      
      ctx.fillStyle = 'white';
      ctx.fillText(time_left_string, 15, 122, w);
      ctx.fillStyle = 'black';
      ctx.textAlign = 'right';  
      ctx.fillText("B: " + stored_data.bed_temp, 137, 133);
      ctx.fillText("N: " + stored_data.nozzle_temp, 137, 145);
      
      
      
      ctx.font = '18px bold Gothic';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.fillText(stored_data.printer_state.toUpperCase(), 10, 140);
    } else if (stored_data.printer_state == "Offline") {
      //Printer is disconnected entirely
      ctx.font = '18px bold Gothic';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.fillText("PRINTER OFF", 10, 140);
      ctx.font = '14px bold Gothic';
      ctx.textAlign = 'right';
    } else {
      //Printer is in standby
      ctx.font = '18px bold Gothic';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.fillText("STANDBY", 10, 140);
      ctx.font = '14px bold Gothic';
      ctx.textAlign = 'right';
      ctx.fillText("B: " + stored_data.bed_temp, 137, 138);
      ctx.fillText("N: " + stored_data.nozzle_temp, 137, 150);
    }
  } else if (stored_data.error == 1) {
    //Bad API key
    ctx.font = '18px bold Gothic';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.fillText("API KEY ERROR", 10, 140);
  } else {
    //No connection yet.
    ctx.font = '18px bold Gothic';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    if (g_timeout < 2){
      ctx.fillText("CONNECTING...", 10, 140);
    } else{
      ctx.fillText("CONNECTION FAIL", 10, 140);
    }
    g_timeout++;  
    
  }
});

function createRoundedRect(x, y, width, height, round, ctx){
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width - round, y + height);
  ctx.lineTo(x + width, y + height - round);
  ctx.lineTo(x + width, y + round);
  ctx.lineTo(x + width - round, y);
  ctx.lineTo(x + round, y);
  ctx.lineTo(x, y + round);
  ctx.lineTo(x, y + height);
  ctx.closePath();
}

function drawProgressBar(x, y, width, height, progress, ctx){
  createRoundedRect(x, y, width, height, 5, ctx);
  ctx.fillStyle = "#555555";
  ctx.fill();
  
  if (Math.floor(progress) > 0){
    //Don't draw if 0 because that makes artifacts
    createRoundedRect(x, y, width * (progress / 100), height, 5, ctx);
    ctx.fillStyle = "#00FF55";
    ctx.fill();
  }
  
  createRoundedRect(x, y, width, height, 5, ctx);
  ctx.strokeStyle = "black";
  ctx.stroke();
  
  ctx.fillStyle = "black";
  ctx.font = "18px bold Gothic";
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(progress) + "%", x + width/2, y - 3);
  
  
}
rocky.on('message', function(event){
  if (event.data.type == "printerProgress"){
    stored_data.progress = event.data.progress;
    stored_data.time_left = event.data.time_left;
    stored_data.init = true;
    stored_data.printer_state = event.data.state;
    stored_data.filename = event.data.filename;
  } else if (event.data.type == "printerTemp"){
    stored_data.bed_temp = event.data.bed_temp;
    stored_data.nozzle_temp = event.data.nozzle_temp;
    stored_data.init = true;
  } else if (event.data.type == "weather"){
    stored_data.weather_temp = event.data.temp;
    stored_data.weather_desc = event.data.desc;
    stored_data.weather_init = true;
  } else if (event.data.type == "invalid_api_key"){
    stored_data.error = 1;
  }
  rocky.requestDraw();
});

rocky.on('minutechange', function(event) {
  rocky.postMessage({"fetch":true});
  rocky.requestDraw();
});

rocky.on('hourchange', function(event) {
  rocky.postMessage({"fetch_weather":true});
});

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
