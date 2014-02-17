var express = require("express");
var app = express();
var port = 3700;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
});
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));
var util = require('util');
//console.log(util.inspect(data, false, null));



io.sockets.on('connection', function (socket) {
 	
	function sendRoomList(){
	 	var roomlist = [] ;
		var rooms = io.sockets.manager.rooms ;
		for (var room in rooms){
			roomlist.push(room.replace("/","")) ;
		}
		socket.broadcast.emit('roomList',roomlist) ;
	}

	sendRoomList() ;

	socket.on('subscribe', function(data) { 
		socket.join(data.room); 
		console.log("Joined room:" + data.room) ;
		sendRoomList();
	});

	socket.on('unsubscribe', function(data) { 
		socket.leave(data.room); 
		console.log("Leaved room:" + data.room) ;
		sendRoomList();
	});

	socket.on('message',function(data){
		var rooms = io.sockets.manager.roomClients[socket.id] ;
		for (var room in rooms){
			var cleanRoomName = room.replace("/","") ;
			if (cleanRoomName !== ""){
				console.log("Sending to room: " + cleanRoomName) ;
				socket.broadcast.to(cleanRoomName).emit('message', data)
			}
		}
	});
});

console.log("Listening on port " + port);