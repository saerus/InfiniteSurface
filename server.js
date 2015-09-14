// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');
// Using the filesystem module
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}
// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log("We have a new client: " +socket.id);
	io.sockets.connected[socket.id].emit("youare", socket.id);
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('gimmeclientlist',
      function(data) {
      	var clientlist = Object.keys(io.engine.clients);
      	console.log("Send this: "+clientlist+" to: "+socket.id);
        io.sockets.connected[socket.id].emit('clientlist', clientlist);
      }
    );
    socket.on('blink',
    	function(data) {
    	console.log("Blink: "+data);
    	io.sockets.connected[data].emit('blink');
	  }
	);
	socket.on('blinktemp',
    	function(data) {
    	console.log("Blink TEMP: "+data);
    	io.sockets.connected[data].emit('blinktemp');
	  }
	);
	socket.on('unblink',
    	function(data) {
    	console.log("Un-Blink: "+data.who);
    	io.sockets.connected[data.who].emit('unblink', data);
	  }
	);
	socket.on('unblinkall',
    	function(data) {
    	console.log("Un-Blink: ");
    	io.sockets.emit('unblinkall');
	  }
	);
    socket.on('disconnect',
    	function() {
    	console.log("Client has disconnected");
	  }
	);
  	var clientsnbr = io.engine.clientsCount;
  	io.sockets.emit('nbr', clientsnbr);
    console.log("Donne le nbr de clients: " +clientsnbr);
  }
);