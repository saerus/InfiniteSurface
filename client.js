var socket;
var detect = false;
var val = 0;
//var capture;
var img;
var mypos;
var pos;
var posDiff;
var lngth;
var mycolor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  mypos = createVector(0, 0);
  pos = createVector(0, 0);
  posDiff = createVector(0, 0);
  mycolor = createVector(0, 0, 0);
  
  img = loadImage("haha.png"); 
  //capture = createVideo(["cave.mp4", "cave.ogv", "cave.webm"]); // ["/a.mov"]
  //capture.size(320, 240);
  //capture.hide();
  socket = io.connect('10.30.67.79:4242');
  socket.emit('joinroom', "slave");
  socket.on('blink',
    function(data) {
      detect = true;
      socket.emit('imdetectable', data);
    }
  );
  socket.on('unblink',
    function(data) {
      detect = false;
      mypos.x = data.x;
      mypos.y = data.y;
      socket.emit('ivebeendetected', data);
    }
  );
  socket.on('blinktemp',
    function(data) {
      //
      val = 1;
    }
  );
  socket.on('changecolor',
    function(data) {
      //
      mycolor.x = float(data.r);
      mycolor.y = float(data.g);
      mycolor.z = float(data.b);
    }
  );
  socket.on('updatepos',
    function(data) {
      //
      pos.x = data.x;
      pos.y = data.y;
      posDiff.x = pos.x-mypos.x;
      posDiff.y = pos.y-mypos.y;
      lngth = mag(posDiff);
      
    }
  );
}
function mousePressed() {
  capture.nextFrame();
}
function draw() {
  
    background(0);
    //background(floor(mycolor.x), floor(mycolor.y), floor(mycolor.z));
    var m = 2;
    //image(img, -pos.x*img.width*m, -pos.y*img.height*m, img.width*m, img.height*m);
  
  if(val>0) {
    val-=0.05;
  }
  //image(capture, 0, 0, 320, 240);
  noStroke();
  fill(255, 0, 0);
  //text("CLIENT"+mypos.x+" / "+mypos.y+"    "+width, 10, 10);
  // REPLACE EVERYTHING FOR DETECTION
  if(detect) {
    background(0, 0, 255);
  }
  stroke(255);
 strokeWeight(10);
lngth = 1;
  line(width/2, height/2, width/2+posDiff.x*lngth*10000, height/2+posDiff.y*lngth*10000);
}