 var express = require("express");
 var app = express();

 /* serves main page */
 app.get("/", function(req, res) {
    res.sendFile(__dirname+'/client.html')
 });
  app.get("/webcam", function(req, res) {
    res.sendFile(__dirname+'/webcam.html')
 });

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     //console.log('static file request : ' + req.params);
     res.sendFile( __dirname + req.params[0]); 
 });

 var port = process.env.PORT || 4242;
var server = app.listen(port, function() {
   console.log("Listening on " + port);
 });

 var io = require('socket.io').listen(server);
 
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
      	io.sockets.in("slave").emit('reset');
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
	socket.on('reset',
    	function(data) {
    	console.log("RESET all");
    	io.sockets.in("slave").emit('reset');
	  }
	);
    socket.on('blink',
    	function(data) {
    	console.log("Blink: "+data);
    	io.sockets.connected[data].emit('blink', data);
	  }
	);
	socket.on('imdetectable',
    	function(data) {
    		console.log("I'm detectable: "+data);
    		io.sockets.in("master").emit('imdetectable', data);
	  }
	);
	socket.on('ivebeendetected',
    	function(data) {
    		console.log("I've been detected: "+data);
    		io.sockets.in("master").emit('ivebeendetected', data);
	  }
	);
	socket.on('blinktemp',
    	function(data) {
    	console.log("Blink TEMP: "+data);
    	io.sockets.connected[data].emit('blinktemp');
	  }
	);
	socket.on('changecolor',
    	function(data) {
    	//console.log("Change Color: "+data.r+" "+data.g+" "+data.b);
    	io.sockets.connected[data.who].emit('changecolor', data);
	  }
	);
	socket.on('updatepos',
    	function(data) {
    	//console.log("updatepos: "+data);
    	io.sockets.in("slave").emit('updatepos', data);
	  }
	);
	socket.on('unblink',
    	function(data) {
    	console.log("Un-Blink: "+data.x+" "+data.y);
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