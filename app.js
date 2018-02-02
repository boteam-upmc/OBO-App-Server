const net = require('net');
const db = require('./database');
const fs = require('fs');
const androidClient = 'ANDROID/';
const videoDirectory = process.cwd() + "/resources/";
const nameDirectory = "/resources/";

var sockets = [];

const svrport = 3500;

var counter = new Date().getMinutes() + "" + new Date().getSeconds() + "" + new Date().getUTCMilliseconds();

console.log('Node.js server is ready.');

/* Connect to the database */
db.this.connect(db.isConnected());




/* SOCKET UDP SERVER */
/* **************** */
const PORT = 3001;
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var c = 0;
var ack = "";
var dt;

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    if(message.toString().startsWith("EOF")) {

        var split = message.toString().split("/");

        console.log(message.toString());

        dt = new Date();

        db.this.query('INSERT INTO video(video_id, creation_date, duration, image_url, robot_id, title, user_id, video_url) VALUES(' +
            counter + ',' +
            '\'' + dt.getFullYear()
            + '-' + dt.getMonth()+1
            + '-' + dt.getDate()
            + ' ' + dt.getHours()
            + ':' + dt.getMinutes()
            + ':' + dt.getSeconds()
            + '.' + dt.getMilliseconds() + '\'' + ',' +
            '\'mp4\'' + ',' +
            '\'' + nameDirectory + 'thumbnail' + '.jpeg' + '\'' + ',' +
            split[2] + ',' +
            '\'' + 'VIDEO_' + counter + '\'' + ',' +
            split[1] + ',' +
            '\'' + nameDirectory + 'VIDEO_' + counter + '.mp4' + '\'' +
            ');')
            .on('error', function (err) {
                ack = new Buffer("VRR");
                server.send(ack, 0, ack.length, remote.port, remote.address, function (err, bytes) {
                    console.log("sent VRR");
                });
                console.log(err);
            })
            .on('result', function () {

                db.this.query('UPDATE user SET number_of_videos_taken = number_of_videos_taken + 1 WHERE user_id = ' + split[1] + ';')
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
            });

        counter = new Date().getMinutes() + "" + new Date().getSeconds() + "" + new Date().getUTCMilliseconds();
        c = 0;

    } else {
        console.log(remote.address + ':' + remote.port + ' - ' + 'VIDEO_' + counter + ' packet_' + c++);
        fs.appendFile(videoDirectory + 'VIDEO_' + counter + '.mp4', message, function (err) {
            if (err) throw err;
        });
        ack = new Buffer("R");
        server.send(ack, 0, ack.length, remote.port, remote.address, function (err, bytes) {
            console.log("sent R");
        });
    }

});

server.bind(PORT);






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


var handleClientData = function(sock, data) {
	if (data.length < 200 ) console.log('Received data from android: ' + data);
	else console.log('Received data from android');

	const event = getTag(data);
	const message = getMessage(data);

    const messageObj = JSON.parse(message);

	if (event === 'onLogin') {


        console.log("LOGIN  "+messageObj.LOGIN);
        console.log("MDP " + messageObj.PASS);

        const robot  = {
			numSerie : messageObj.SERIAL_NUMBER
		};

        checkUser(sock, messageObj);
		//checkUser(messageObj.LOGIN, messageObj.PASS);
        //const fakeUserId = 'user42';
        //webClient.write('ASSOC/' + fakeUserId + '/' + messageObj.SERIAL_NUMBER + '\r');
        webClient.write('ASSOC/' + 1 + '/' + 1 + '\r');

	}else if(event === 'onAssociation') {
        //const messageObjAssoc = JSON.parse(message);
        console.log("LOGIN  "+messageObj.LOGIN);
        console.log("MDP " + messageObj.PASS);

        const robotAssoc  = {
            numSerie : messageObj.SERIAL_NUMBER
        };

        db.this.query('INSERT IGNORE INTO robot (serial_number) VALUES(' +
            '\'' + robotAssoc.numSerie + '\'' +
            ');')
            .on('error', function (err) {
                console.log(err);
            })
            .on('result', function () {
                var request = 'SELECT robot_id FROM robot WHERE serial_number = ' +
                    '\'' + robotAssoc.numSerie + '\'' +
                    ';'
                db.this.query(request, function (error, result, field) {
                    if(error === null) {
                        var id_robot = result[0].robot_id;

                        var request = 'SELECT user_id FROM user WHERE password = ' +
                            '\'' + messageObj.PASS + '\'' +
                            ' AND username = ' +
                            '\'' + messageObj.LOGIN + '\'' +
                            ';'
                        db.this.query(request, function (error, result, field) {
                            if (error === null) {
                                var id_user = result[0].user_id;
                                console.log("GET ID ROBOT : " + id_robot);
                                console.log("GET ID USER: " + id_user);


                                db.this.query('INSERT INTO user_robot (user_id, robot_id, associated) VALUES(' +
                                    id_user + ', ' +
                                    id_robot + ', ' +
                                    0 +
                                    ');')
                                    .on('error', function (err) {
                                        console.log(err);
                                    })
                                    .on('result', function () {
                                        sock.write("DATA/" + id_user + "/" + id_robot + '/\n');
                                        console.log("Insert OK");
                                    });

                            } else {
                                console.log(error);
                            }
                        });
                    } else {
                        console.log(error);
                    }

                });
            });

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
        stringData.includes("onAssociation")) {
        return stringData.substring(0, stringData.indexOf('/'));
    }

    return "onVideo";

};

getMessage = function(data) {

    const stringData = data.toString();

    if (stringData.includes("onLogin") ||
        stringData.includes("onAssociation")) {
        return stringData.substring(stringData.indexOf('/') + 1);
    }

    return data;
};

var checkUser = function(sock, user) {


    //messageObj=robot;
   var userselectString = 'SELECT* FROM user WHERE username="'+user.LOGIN+'"';
    
  db.this.query(userselectString,function(error, resul,field){

     console.log("NOT "+resul[0]);
     if(resul[0]==null){
        sock.write('Notidentified\n');
        console.log("NOT EGEAU");
     }
    else{
       const bddhashpass=resul[0].password;
        if(user.PASS==bddhashpass) {
            console.log("OK EGEAU " + resul[0].passe);
            sock.write('identified\n');
        } else {
            sock.write('Notidentified\n');
            console.log("in else NOT EGEAU");

        }

    }
});

};

// ************ ROBOT Control ************
var express = require('express');
var app = express();
var serverApp = require('http').Server(app);
var io = require('socket.io')(serverApp);
var constant = require('./constants');
var handleRobotControlEvents = require('./events-receiver');

app.use(express.static('public'));
serverApp.listen(3000);

io.on(constant.EVENT_CONNECT, function (socket) {
        
    console.log('Client %s connected.', socket.id);    
    
    socket.on('getStream', function (stream) {    
        socket.broadcast.emit('setStream', stream);
    });        
        
    handleRobotControlEvents(socket);
});
// ************ ROBOT Control ************
