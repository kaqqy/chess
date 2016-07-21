var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chess = require('./chess.min').Chess;

var rooms = {}; // key is roomName, value is object containing start: true/false
/*var openRooms = {};
var gamesIP = {}; //in progress*/

//test
/*var chess = new Chess();

while (!chess.game_over()) {
	var moves = chess.moves();
	var move = moves[Math.floor(Math.random() * moves.length)];
	console.log(chess.ascii());
	console.log(move);
	chess.move(move);
}*/
//endtest

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
	socket.emit('updateRooms', rooms);

	socket.on('createGame', function(roomName) {
		if (rooms[roomName] != null) {
			socket.emit('alert', 'Room name already taken');
			return;
		}
		socket.join(roomName);
		rooms[roomName] = {start: false, black: null, white: null};
		if (Math.floor(Math.random() * 2)) {
			rooms[roomName].black = socket.id;
			socket.emit('joinGame', roomName, 'black');
		}
		else {
			rooms[roomName].white = socket.id;
			socket.emit('joinGame', roomName, 'white');
		}
		io.emit('updateRooms', rooms);
	});

	socket.on('joinGame', function(roomName) {
		if (io.sockets.adapter.rooms[roomName].length >= 2) {
			socket.emit('alert', 'Can\'t join room');
			return;
		}
		socket.join(roomName);
		rooms[roomName].start = true;
		if (rooms[roomName].white == null) {
			rooms[roomName].white = socket.id;
			socket.emit('joinGame', roomName, 'white');
		}
		else {
			rooms[roomName].black = socket.id;
			socket.emit('joinGame', roomName, 'black');
		}
		io.emit('updateRooms', rooms);
	});

	/*//sends all available room information
	socket.emit('updateRooms', openRooms);

	socket.on('joinGame', function (roomName, color) {
		socket.join(roomName);
		if (io.sockets.adapter.rooms[roomName].length >= 3) {
			socket.leave(roomName);
			return;
		}
		if (io.sockets.adapter.rooms[roomName].length == 1) {
			gamesIP[roomName] = {color: socket.id};
			openRooms[roomName] = (color == 'black' ? 'white' : 'black');
		}
		else {
			gamesIP[roomName][color] = socket.id;
			delete openRooms[roomName];
		}
		io.emit('updateRooms', openRooms);
		io.emit('updateGames', gamesIP);
	});*/
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 2000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(server_port, server_ip_address, function () {
	console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});