var socket;
var capture;
var state = 0; // 0 = rien, 1 = blink dans l'ordre, 2 = detecte->passe au suivant to 1
var currentClient = 0;
//
var pos = new p5.Vector(0, 0);
var nbr;
var x;
var y;
var ones = [];
//
var routine = 0;
//
var iam;
var clientlist;
var waitfor = 0;
var t = 50;
//
var pg;
//
function setup() {
  createCanvas(320, 240);
  pg = createGraphics(320, 240);
  socket = io.connect('192.168.1.33:8080');
  socket.emit('joinroom', "master");
  //
  capture = createCapture();
  capture.size(320, 240);
  capture.hide();
  //
  socket.on('clientlist',
    function(data) {
      print("client list: " + data);
      clientlist = data;
      launchDetection();
    }
  );
  /*socket.on('blink',
    function(data) {
      print("BLINK !!!!!");
    }
  );*/

}

function launchDetection() {
  ones = [];
  currentClient = -1;
  nextClient();
}

function nextClient() {
  currentClient++;
  if (currentClient < clientlist.length) {
    state = 1;
    waitfor = 0;
    socket.emit('blink', clientlist[currentClient]);
    print("BLINK: " + clientlist[currentClient]);
  } else {
    print("THIS IS DONE !");
  }
}

function mousePressed() {
  socket.emit('gimmeclientlist');
}

function draw() {
    background(255, 0, 0);
    image(capture, 0, 0, 320, 240);
    loadPixels();
    pos = new p5.Vector(0, 0);
    nbr = 0;
    for (var i = 0; i < (width * height) * 4; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      if (b > 130 && r + g + b < 350) {
      //if (r + g + b > 600) {
        nbr++;
        //
        y = floor((i / 4) / width);
        x = (i / 4) - (y * width);
        //
        pos.add(x, y);
        pixels[i] = 0;
        pixels[i + 1] = 255;
        pixels[i + 2] = 0;
        pixels[i + 2] = 0;
      }
    }
    pos.div(nbr);
    updatePixels();
    fill(0);
    ellipse(pos.x, pos.y, 10, 10);
    if (state == 1 && waitfor >= t) {
      if (nbr > 100) {
        var data = {
          x: pos.x,
          y: pos.y,
          who: clientlist[currentClient]
        }
        socket.emit('unblink', data);
        print("UN-BLINK: X: " + pos.x + " Y: " + pos.y + " to: " + clientlist[currentClient]);
        append(ones, new One(pos.x, pos.y, clientlist[currentClient]));
        print(ones.length);
        state = 0;
        nextClient();
      }
    } else {
      waitfor++;
    }
    routine += 1;
    if (routine == 100) {
      routine = 0;
    }
    for (var i = 0; i < ones.length; i++) {
      ones[i].test(routine);
    }
    //print(routine);
    stroke(255);
    line(routine / 100 * width, 0, routine / 100 * width, height);
    noStroke();
    fill(255);
    if(clientlist) {
      text(clientlist.length, 10, 10);
    }
  }
  // CLASS ONE
function One(_x, _y, _who) {
  this.x = floor((_x / width) * 100);
  this.y = floor((_y / height) * 100);
  this.who = _who;
  //
  this.emit = function() {

  }
  this.test = function(_i) {
    if (this.x == _i) {
      socket.emit('blinktemp', this.who);
      print(this.x + " " + this.y + " " + this.who);
    }
  }
}