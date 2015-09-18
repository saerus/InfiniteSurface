var socket;
var detect = false;
var val = 0;
//var capture;
var img;
var pos;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  pos = createVector(0, 0);
  
  img = loadImage("haha.png"); 
  //capture = createVideo(["cave.mp4", "cave.ogv", "cave.webm"]); // ["/a.mov"]
  //capture.size(320, 240);
  //capture.hide();
  socket = io.connect('192.168.130.204:8080');
  socket.emit('joinroom', "slave");
  socket.on('blink',
    function(data) {
      detect = true;
    }
  );
  socket.on('unblink',
    function(data) {
      detect = false;
      pos.x = data.x;
      pos.y = data.y;
    }
  );
  socket.on('blinktemp',
    function(data) {
      //
      val = 1;
    }
  );
}
function mousePressed() {
  capture.nextFrame();
}
function draw() {
  
    background(0);
    background(255*val, 255*val, 255*val);
    var m = 2;
    //image(img, -pos.x*img.width*m, -pos.y*img.height*m, img.width*m, img.height*m);
  
  if(val>0) {
    val-=0.05;
  }
  //image(capture, 0, 0, 320, 240);
  noStroke();
  fill(255, 0, 0);
  text("CLIENT"+pos.x+" / "+pos.y, 10, 10);
  // REPLACE EVERYTHING FOR DETECTION
  if(detect) {
    background(0, 0, 255);
  } 
}