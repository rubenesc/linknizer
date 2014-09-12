

module.exports = function(app, server){

	var socketIO = require('socket.io').listen(server);

	if (!app.settings.socketIO){
		//store a reference of socketIO
		app.set('socketIO', socketIO);
	}


	socketIO.sockets.on('connection', function(socket){
		console.log ('socketIO:CONNECTED');
	});

}