var mysql = require('mysql');

var db = mysql.createConnection({
	host: 'localhost',
	user: 'boteam',
	password: 'teambot',
	database: 'bdd_mondiale'
});

var isConnected = function(err) {
	if (err) {
		console.log(err);
		process.exit(1);

	} else {
		console.log('Connected to the database.');
	}
};

module.exports = {
	this: db,
	isConnected : isConnected
};
