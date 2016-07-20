var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chess = require('./chess.min').Chess;

//test
var chess = new Chess();

while (!chess.game_over()) {
	var moves = chess.moves();
	var move = moves[Math.floor(Math.random() * moves.length)];
	console.log(chess.ascii());
	console.log(move);
	chess.move(move);
}
//endtest

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 2000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(server_port, server_ip_address, function () {
	console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});