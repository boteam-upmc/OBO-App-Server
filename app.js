const net = require('net');
const db = require('./database');
const fs = require('fs');
const androidClient = 'ANDROID/';
const videoDirectory = process.cwd() + "/Video/";

var sockets = [];

const svrport = 3000;

var counter = 0;
var videoCounter = 1011;
var imageCounter = 0;

console.log('Node.js server is ready.');

/* Connect to the database */
db.this.connect(db.isConnected());




/* SOCKET UDP SERVER */
/* **************** */
const PORT = 3001;
//const HOST = "192.168.1.89";
//const HOST = "192.168.1.34";
const HOST = "192.168.43.250";
//const HOST = "192.168.1.22";
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var c = 0;
var ack = "";

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    if(message.toString() === "EOF") {
        db.this.query('INSERT INTO Videos(idVideo, urlImage, urlVideo, duration, date, title, idUser,idRobot) VALUES(' +
            videoCounter + ',' +
            '\'' + videoDirectory + 'thumbnail_' + imageCounter + '.png' + '\'' + ',' +
            '\'' + videoDirectory + 'VIDEO_' + counter + '.mp4' + '\'' + ',' +
            '\'23\'' + ',' +
            '\'2017-11-12\'' + ',' +
            '\'' + 'VIDEO_' + counter + '\'' + ',' +
            '1' + ',' +
            '1' +
            ');')
            .on('error', function (err) {
                ack = new Buffer("VRR");
                server.send(ack, 0, ack.length, remote.port, remote.address, function (err, bytes) {
                    console.log("sent VRR");
                });
                console.log(err);
            })
            .on('result', function () {
                ack = new Buffer("VWR");
                server.send(ack, 0, ack.length, remote.port, remote.address, function (err, bytes) {
                    console.log("sent VWR");
                });
                console.log('Robot insertion succeeded.');
            });

        videoCounter++;
        imageCounter++;
        counter++;
        c = 0;

    } else {
        console.log(remote.address + ':' + remote.port + ' - ' + 'VIDEO_' + counter + 'packet' + c++);
        fs.appendFile(videoDirectory + 'VIDEO_' + counter + '.mp4', message, function (err) {
            if (err) throw err;
        });
        ack = new Buffer("R");
        server.send(ack, 0, ack.length, remote.port, remote.address, function (err, bytes) {
            console.log("sent R");
        });
    }

});

server.bind(PORT, HOST);






var svr = net.createServer(function(sock) {

    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);

    sockets.push(sock);

    sock.write('Welcome to server !\n');

    sock.on('data', function(data) {
        handleClientData(sock, data);
    });

    sock.on('error', function(error) {
        throw error;
    });

    sock.on('end', function() {
        console.log('Diconnected :' + sock.remoteAddress + ':' + sock.remotePort);

        if(sockets.indexOf(sock) !== -1) {
            delete sockets[sockets.indexOf(sock)];
        }
    });

});

svr.listen(svrport);

var webClient = new net.Socket();
webClient.connect(60372, function() {
    console.log('Spring server is ready.');

	webClient.on('data', function(data) {
	    handleServerData(sock, data);
    });

	webClient.on('error', function(error) {
		throw error;
	});

	webClient.on('end', function() {
		console.log('Spring server disconnected.');
	});

}).on('error', function () {
    console.log('Spring server not found.');
});

var handleServerData = function(sock, data) {
    console.log('Received data from spring: ' + data);

    const event = getTag(data);
    //const id    = getID(data);

    if (event === 'VALID') {
        sock.write(data + '\n');

    } else {
        console.log('Error_HSD : Event' + event + ' not found.');
    }
};

var handleClientData = function(sock, data) {
	if (data.length < 100 ) console.log('Received data from android: ' + data);
	else console.log('Received data from android');

	const event = getTag(data);
	const message = getMessage(data);

	if (event === 'onLogin') {

		const messageObj = JSON.parse(message);

        const robot  = {
			numSerie : messageObj.SERIAL_NUMBER
		};

        insertRobot(sock, robot);
		//checkUser(messageObj.LOGIN, messageObj.PASS);
        //const fakeUserId = 'user42';
        //webClient.write('ASSOC/' + fakeUserId + '/' + messageObj.SERIAL_NUMBER + '\r');
        webClient.write('ASSOC/' + 1 + '/' + 1 + '\r');

	} else if (event === 'onVideo') {
	    if (message === 'EOF') {
            counter = counter + 1;
            sock.write('RECEIVED\n');
            console.log("DC_RECEIVED");

	    } else if (data.toString().endsWith("EOF")) {
            fs.appendFile(videoDirectory + 'VIDEO_' + counter + '.mp4', data.toString().substring(0, data.toString().indexOf("onVideo")), function (err) {
                if (err) throw err;
            });
            console.log("RECEIVED " + counter);
            sock.write('DC_RECEIVED ' + counter++ + '\n');
        } else {
            fs.appendFile(videoDirectory + 'VIDEO_' + counter + '.mp4', message, function (err) {
                if (err) throw err;
            });
        }

	} else if (event === 'TEST') {
        sock.write("DC : YOUPI !!!\n");

    } else {
		fs.writeFile(videoDirectory + "error_" + counter + ".txt", event + "\n\n\n" + message, (err) => {
            if (err) {
                console.log("FAILED");
            }
        });
		console.log('Error_HCD : Event ' + event + ' not found.');
	}
};

getID = function(data) {
    var stringData = data.toString();
    var lenght = stringData.indexOf('/');

    return stringData.substring(lenght + 1, stringData.indexOf('/', lenght + 1));
};

getTag = function(data) {

    const stringData = data.toString();

    if (stringData.includes("onLogin") ||
        stringData.includes("VALID")  ||
        stringData.startsWith("TEST")) {
        return stringData.substring(0, stringData.indexOf('/'));
    }

    return "onVideo";

};

getMessage = function(data) {

    const stringData = data.toString();

    if (stringData.includes("onLogin") ||
        stringData.includes("VALID")  ||
        stringData.includes("TEST")) {
        return stringData.substring(stringData.indexOf('/') + 1);
    }

	/*if (stringData.includes("onVideo")) {
        return stringData.substring(stringData.indexOf('/') + 1);
    }*/

    return data;
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

var insertRobot = function(sock, robot) {
    db.this.query('INSERT IGNORE INTO Robots SET ?', robot)
        .on('error', function (err) {
            sock.write(androidClient + 'Robot insertion failed.\n');
            console.log(err);
        })
        .on('result', function () {
            sock.write(androidClient + 'Robot insertion succeeded.\n');
            console.log('Robot insertion succeeded.');
        });
};

var insertVideo = function(sock, video) {
    db.this.query('INSERT IGNORE INTO Videos SET ?', video)
        .on('error', function (err) {
            sock.write(androidClient + 'Video insertion failed.\n');
            console.log(err);
        })
        .on('result', function () {
            sock.write(androidClient + 'Video insertion succeeded.\n');
            console.log('Video insertion succeeded.');
        });
};