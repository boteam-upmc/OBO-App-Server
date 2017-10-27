var net = require('net');
var db = require('./database');

const androidClient = 'ANDROID/';

var client;

console.log('Server is ready.');

/* Connect to the database */
db.this.connect(db.isConnected());

net.createServer(function(c) {
	console.log('Client connected.');

    client = c;
    
	client.on('data', handleData);

	client.on('error', function(error) {
		throw error;
	});

	client.on('end', function() {
		console.log('Client disconnected.');
	});	

}).listen(1337);

handleData = function(data) {
	console.log('Received data : ' + data);

	var event = getTag(data);
	var message = getMessage(data);
	var messageObj = JSON.parse(message);

	if (event === 'onLogin') {
        
		var user  = {
			nom : messageObj.FIRST_NAME,
			prenom : messageObj.SECOND_NAME,
			mail : messageObj.EMAIL,
			alpha : messageObj.ALPHA
		};		
        
		insertUser(user);        

	} else if (event === 'onAssociationRequest') {
        
        var robot  = {
			numSerie : messageObj.SERIAL_NUMBER
		};
    
        insertRobot(robot);
        client.write('ASSOC/' + messageObj.SERIAL_NUMBER + '\r');
    
    } else if (event === 'VALID') {
        client.write(data + '\n');
        
    } else {
		console.log('Error : Event' + event + ' not found.');
	}
};

getTag = function(data) {
	return data.toString().substr(0, data.indexOf('/'));
};

getMessage = function(data) {
	return data.toString().substr(data.indexOf('/') + 1);
};

insertUser = function(user) {
	db.this.query('INSERT IGNORE INTO Users SET ?', user)
        .on('error', function(err) {                
            client.write(androidClient + 'User insertion failed.\n');
            console.log(err);
        })
        .on('result', function() {
            client.write(androidClient + 'User insertion succeeded.\n');            
            console.log('User insertion succeeded.');
        });
};

insertRobot = function(robot) {
	db.this.query('INSERT IGNORE INTO Robots SET ?', robot)
        .on('error', function(err) {
            client.write(androidClient + 'Robot insertion failed.\n');
            console.log(err);
        })
        .on('result', function() {
            client.write(androidClient + 'Robot insertion succeeded.\n');
            console.log('Robot insertion succeeded.');
        });
};
