// Keep track of our socket connection
var socket;
var detect = false;
var val = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('192.168.1.33:8080');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('blink',
    // When we receive data
    function(data) {
      detect = true;
    }
  );
  socket.on('unblink',
    // When we receive data
    function(data) {
      detect = false;
    }
  );
  socket.on('blinktemp',
    // When we receive data
    function(data) {
      //
      val = 1;
    }
  );
  socket.on('unblinkall',
    // When we receive data
    function(data) {
      detect = false;
    }
  );
}
function draw() {
  if(detect) {
    background(0, 0, 255);
  } else {
    background(0, 0, 0);
    background(255*val, 255*val, 255*val);
  }
  if(val>0) {
    val-=0.05;
  }
}
// Function for sending to the socket