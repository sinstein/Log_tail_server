/*
------
os.EOL - to add platform specific end of line symbol
------
*/

var http = require('http'),
    fs = require('fs'),
    io = require('socket.io');

//Basic check to ensure required number of arguments are entered
if (process.argv.length < 4) {
  console.log("Usage: node index.js [logFile] [port]");
  process.exit(-1);
}


var port = process.argv[3];
var file = process.argv[2];

var server = http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-type': 'text/html'
  });
  res.end(fs.readFileSync(__dirname + '/index.html'));
}).listen(port, function() {
  console.log('Listening at: http://localhost:' + port);
});

var socket = io.listen(server);
var tail = require('./tail')(file);

tail.on('update', function(chunk) {
  socket.emit('message', chunk)
});

socket.on('connection', function(socket) {
  socket.emit('message', tail.getLines())
});
