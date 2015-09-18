var http = require('http');
var fs = require('fs');
var path = require('path');
var server = http.createServer(function (request, response) {
    console.log('request starting...');
	
	var filePath = request.url;
	if (filePath == '/') {
		filePath = '/client/index.htm';
	}
	if (filePath == '/master') {
		filePath = '/webcam/index.htm';
	}
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	fs.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
	
}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');// WebSocket Portion
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
      	var clientlist = io.sockets.adapter.rooms['slave'];
      	if(clientlist) {
      		console.log("Send this: "+Object.keys(clientlist)+" to: "+socket.id);
        	io.sockets.connected[socket.id].emit('clientlist', Object.keys(clientlist));
      	}
      	//var clientlist = io.sockets.clients("slave");
      }
    );
    socket.on('joinroom',
    	function(data) {
    	socket.join(data);
    	console.log("Joined room: "+data);
    	//
    	/*
    	var clientsnbr = io.engine.clientsCount;
  		io.sockets.in('master').emit('nbr', clientsnbr);
    	console.log("Donne le nbr de clients: " +clientsnbr);
    	*/
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
    socket.on('disconnect',
    	function() {
    	console.log("Client has disconnected");
	  }
	);
  }
);