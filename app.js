var net = require('net');
var db = require('./database');
var fs = require('fs');
const androidClient = 'ANDROID/';

var mobileClient;
var webClient;

console.log('Node.js server is ready.');

/* Connect to the database */
db.this.connect(db.isConnected());

net.createServer(function(client) {
	console.log('Android client connected.');

    mobileClient = client;
    
	mobileClient.on('data', handleClientData);

	mobileClient.on('error', function(error) {
		throw error;
	});

	mobileClient.on('end', function() {
		console.log('Android client disconnected.');
	});

}).listen(3000);

var webClient = new net.Socket();
webClient.connect(60372, function() {    
    console.log('Spring server is ready.');
    
	webClient.on('data', handleServerData);

	webClient.on('error', function(error) {
		throw error;
	});

	webClient.on('end', function() {
		console.log('Spring server disconnected.');
	});
    
}).on('error', function (err) {
    console.log('Spring server not found.');
});

handleServerData = function(data) {
    console.log('Received data from spring: ' + data); 

    var event = getTag(data);	
        
    if (event === 'VALID') {        
        mobileClient.write(data + '\n');
        
    } else {
        console.log('Error : Event' + event + ' not found.');
    }
};

handleClientData = function(data) {
	if (data.length < 100 ) console.log('Received data from android: ' + data);
	else console.log('Received data from android');

	var event = getTag(data);
	var message = getMessage(data);

	if (event === 'onLogin') {

		var messageObj = JSON.parse(message);

        var robot  = {
			numSerie : messageObj.SERIAL_NUMBER
		};
        
        insertRobot(robot);
		//checkUser(messageObj.LOGIN, messageObj.PASS);
        //const fakeUserId = 'user42';
        //webClient.write('ASSOC/' + fakeUserId + '/' + messageObj.SERIAL_NUMBER + '\r');
        webClient.write('ASSOC/' + 1 + '/' + 1 + '\r');

	} else if (event === 'onVideo') {
		if (message !== 'EOF') {
            fs.writeFile("/home/mrgrandefrite/Bureau/VIDEO.mp4", message, (err) => {
                if (err) {
                    console.log("FAILED");
                }
            });
		} else {
            mobileClient.write('RECEIVED\n');
        }
	} else {
		fs.writeFile("/home/mrgrandefrite/Bureau/error.txt", event + "\n\n\n" + message, (err) => {
            if (err) {
                console.log("FAILED");
            }
        });
		console.log('Error : Event' + event + ' not found.');
	}
};

getTag = function(data) {
    if (data.toString().includes("onVideo/") ||
		data.toString().includes("onLogin/")) {
        return data.toString().substr(0, data.toString().indexOf('/'));
    } else {
    	return "onVideo";
    }
};

getMessage = function(data) {
	if (data.toString().includes("onVideo/") ||
		data.toString().includes("onLogin/")) {
        return data.toString().substr(data.toString().indexOf('/') + 1);
    } else {
		return data;
    }
};

checkUser = function(idSession, pass) {
    db.this.query('SELECT idUser FROM Users WHERE login = ? AND pass = ', idSession, pass)
        .on('result', function(data) {
            data.idSession
            data.pass
        }).on('error', function(err) {
            console.log(err);
    });
};

insertRobot = function(robot) {
	db.this.query('INSERT IGNORE INTO Robots SET ?', robot)
        .on('error', function(err) {
            mobileClient.write(androidClient + 'Robot insertion failed.\n');
            console.log(err);
        })
        .on('result', function() {
            mobileClient.write(androidClient + 'Robot insertion succeeded.\n');
            console.log('Robot insertion succeeded.');
        });
};
