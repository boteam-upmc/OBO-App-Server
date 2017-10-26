var net = require('net');

console.log('Server is ready.');

net.createServer(function(client) {
	console.log('Client connected.');

	client.on('data', handleData);

	client.on('error', function(error) {
		throw error;
	});

	client.on('end', function() {
		console.log('Client disconnected.');
	});

	//client.write('hello');

	/*c.write('hello\r\n');
	c.pipe(c);*/
}).listen(3000);

handleData = function(data) {
	console.log('Received data : ' + data);

	var event = getTag(data);
	var message = getMessage(data);
	var messageObj = JSON.parse(message);

	if (event = 'onLogin') {
		var user  = {
			username : messageObj.USERNAME,
			password : messageObj.PASSWORD
		};

		var robot  = {
			robotId : messageObj.ROBOT_ID
		};

		console.log('username=' + user.username);
		console.log('password=' + user.password);
		console.log('robotId=' + robot.robotId);

	} else {
		console.log('Error : Event' + event + ' not found.');
	}
};

getTag = function(data) {
	return data.toString().substr(0, data.indexOf('_'));
};

getMessage = function(data) {
	return data.toString().substr(data.indexOf('_') + 1);
};