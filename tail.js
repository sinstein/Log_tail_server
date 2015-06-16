/*
------
The followinfg modules installed and included
  # byline - to read stream line by line
  # socket.io - to create socket for communication between server and client
------
os.EOL - to add platform specific end of line symbol
------
*/

var fs = require('fs'),
	endOfLine = require('os').EOL,
	byLine = require('byline');

var tail = function(fileName) {
	var continueFrom = 0;
	var tail_end = new Array();
	var logUpdaters = new Array();

	var addToTail = function (line) {
	  line += endOfLine;
	  continueFrom += line.length;
	  tail_end.push(line);

	  if (tail_end.length > 10) {
	    tail_end.shift();
	  }
	}

	var inStream = byLine(fs.createReadStream(fileName, {start: continueFrom }));
	//Intial tail. To be displayed when user connects
	inStream.on('data', function(line) {
	  addToTail(line.toString());
	});


	//Watches over log file and responds to changes
	fs.watch(fileName, function(event, fname) {
	  if (event == 'change') {
	    var readStream = byLine(fs.createReadStream(fileName, {start: continueFrom }));
	    readStream.on('data', function(line) {
	      addToTail(line.toString());
	      line += endOfLine;
	      for(var i = 0; i < logUpdaters.length; i++) {
	      	logUpdaters[i](line.toString());
	      }
	    });
	  }
	});

	return {
		on: function(event, callback) {
			if (event == 'update')
				logUpdaters.push(callback);
		},
		getLines: function (){
			return tail_end.join("");
		}
	};
}

module.exports = tail;
