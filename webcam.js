var socket;
var capture;
var state = 0;
var currentClient = 0;
//
var pos;
var posLight;
var colorPos;
var colorDetect;
var temp;
var tempColor;
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
var t = 200;
//
var waittoolong = 0;
//
var pg;
var pganime;
//
var imgs = new Array();
//
function setup() {
  //createCanvas(320, 240);
  createCanvas(windowWidth, windowHeight);
  //
  for(var i=0; i<250; i++) {
  	append(imgs, loadImage("imgs/FINAL_"+i+".jpg"));
  }
  //
  pg = createGraphics(320, 240);
  pganime = createGraphics(320, 240);

  pos = createVector(0, 0);
  posLight = createVector(0, 0);
  colorPos = createVector(0, 0, 0);
  colorDetect = createVector(0, 0, 255);

  socket = io.connect('10.30.67.79:4242');
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
  socket.on('imdetectable',
    function(data) {
      if(clientlist[currentClient] == data) {
        state = 1;
        waittoolong = 20;
      }
    }
  );
  socket.on('ivebeendetected',
    function(data) {
      if(clientlist[currentClient] == data) {
        state = 0;
        nextClient();
      }
    }
  );
}

function launchDetection() {
  ones = [];
  currentClient = -1;
  nextClient();
}

function nextClient() {
  currentClient++;
  if (currentClient < clientlist.length) {
    state = 0;
    socket.emit('blink', clientlist[currentClient]);
    //print("BLINK: " + clientlist[currentClient]);
  } else {
  	state = 3;
  	socket.emit('reset');
    //print("THIS IS DONE !");
  }
}

function mousePressed() {
  socket.emit('gimmeclientlist');
}

function draw() {
    background(255, 0, 0);
	pg.image(capture, 0, 0, pg.width, pg.height);
    pg.loadPixels();
    pos = createVector(0, 0);
    nbr = 0;
    for (var i = 0; i < (pg.width * pg.height) * 4; i += 4) {
      colorPos.x = pixels[i];
      colorPos.y = pixels[i + 1];
      colorPos.z = pixels[i + 2];
      if (colorPos.dist(colorDetect)<150) {
        //if (b > 130 && r + g + b < 350) {
        //if (r + g + b > 600) {
        nbr++;
        //
        y = floor((i / 4) / pg.width);
        x = (i / 4) - (y * pg.width);
        //
        pos.add(x, y);
        pixels[i] = 0;
        pixels[i + 1] = 255;
        pixels[i + 2] = 0;
        pixels[i + 2] = 0;
      }
    }
    pos.div(nbr);
    pg.updatePixels();
    image(pg, 0, 0, width, height);
    fill(0);
    ellipse(pos.x/pg.width*width, pos.y/pg.height*height, 10, 10);
   	// --------------------------------------------------------------------------- STATE 1
    if (state == 1) {
      if (nbr > 100) {
        var data = {
          x: (pos.x / pg.width),
          y: (pos.y / pg.height),
          who: clientlist[currentClient]
        }
        socket.emit('unblink', data);
        //print("UN-BLINK: X: " + pos.x + " Y: " + pos.y + " to: " + clientlist[currentClient]);
        append(ones, new One(pos.x, pos.y, clientlist[currentClient]));
        print(ones.length);
        state = 2;
        waitfor = 20;
      } else {
      	if(waittoolong > 0) {
    		waittoolong --;
    	} else {
    		state = 0;
        	nextClient();
    	}
      }
    }
   	// --------------------------------------------------------------------------- STATE 2
    if(state == 2) {
    	if(waitfor > 0) {
    		waitfor --;
    	} else {
    		state = 0;
        	nextClient();
    	}
    }
    /*routine += 1;
    if (routine == 100) {
      routine = 0;
    }*/
    
    //print(routine);
   	// --------------------------------------------------------------------------- STATE 3
    if(state == 3) {
	    stroke(255);
	    //line(routine / 100 * width, 0, routine / 100 * width, height);
	    noStroke();
	    fill(255);
	    if (clientlist) {
	      text(clientlist.length+" / "+state+"     "+width, 10, 10);
	      /*for (var i = 0; i < ones.length; i++) {
	        ones[i].emit();
	      }*/
	      var data = {
	        x: (pos.x / pg.width),
	        y: (pos.y / pg.height)
	      }
	      socket.emit('updatepos', data);
	    }
	    pganime.background(0);
	    pganime.image(imgs[routine]);
	    pganime.loadPixels();
	    //
	    for (var i = 0; i < ones.length; i++) {
			/*temp = ones[i].getpixel();
			if(pixels[temp]>) {
				
			}*/
			ones[i].sendColor(pixels);
			
	    }
	    //
	    pganime.updatePixels();
	    routine++;
	    if(routine>=imgs.length) {
	    	routine = 0;
	    }
	    //
	    image(pganime, 0, 0, 320, 240);
    }
  }
  // CLASS ONE
function One(_x, _y, _who) {
	this.raw = createVector(floor(_x), floor(_y));
  this.xy = createVector(floor((_x / pg.width) * 100), floor((_y / pg.height) * 100));
  this.who = _who;
  this.tempColor = createVector(0, 0, 0);
  this.tempPixel;
  //
  this.emit = function() {
  }
  this.sendColor = function(pixels) {
	this.tempPixel = (this.raw.x+320*this.raw.y)*4;
  	this.tempColor.x = pixels[this.tempPixel+0];
  	this.tempColor.y = pixels[this.tempPixel+1];
  	this.tempColor.z = pixels[this.tempPixel+2];
  	//
  	var data = {
  		who: this.who,
        r: this.tempColor.x,
        g: this.tempColor.y,
        b: this.tempColor.z
      }
  	//
  	socket.emit('changecolor', data);
  	//return 
  	
  }
  this.test = function(_i) {
    if (this.x == _i) {
      socket.emit('blinktemp', this.who);
      //print(this.x + " " + this.y + " " + this.who);
    }
  }
}