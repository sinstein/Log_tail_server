/*
The followinfg modules installed and included
  # byline - to read stream line by line
  # socket.io - to create socket for communication between server and client
--
os.EOL - to add platform specific end of line symbol
--
*/

var fs = require('fs'),
  http = require('http'),
  io = require('socket.io'),
  endOfLine = require('os').EOL,
  byLine = require('byline');

var port = process.argv[3];
var file = process.argv[2];

//Basic check to ensure required number of arguments are entered
if (process.argv.length < 4) {
  console.log("Usage: node index.js [logFile] [port]");
  process.exit(-1);
}

var server = http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-type': 'text/html'
  });
  res.end(fs.readFileSync(__dirname + '/index.html'));
}).listen(port, function() {
  console.log('Listening at: http://localhost:' + port);
});

var socket = io.listen(server);
var continueFrom = 0;
var tail = new Array();
var inStream = byLine(fs.createReadStream(file, {start: continueFrom }));

var addToTail = function (line) {
  line += endOfLine;
  continueFrom += line.length;
  tail.push(line);

  if (tail.length > 10) {
    tail.shift();
  }
}

//Intial tail. To be displayed when user connects
inStream.on('data', function(line) {
  addToTail(line.toString());
});


//Watches over log file and responds to changes
fs.watch(file, function(event, fname) {
  if (event == 'change') {
    var readStream = byLine(fs.createReadStream(file, {start: continueFrom }));
    readStream.on('data', function(line) {
      addToTail(line.toString());
      line += endOfLine;
      socket.emit('message',line.toString())
    });
  }
});


socket.on('connection', function(socket) {
  tail.forEach(function (log){
    socket.emit('message',log);
  });
});
