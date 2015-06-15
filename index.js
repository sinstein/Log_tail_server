var fs = require('fs'),
  http = require('http'),
  io = require('socket.io'),
  lineReader = require('line-reader');

var port = process.argv[3];
var file = process.argv[2];
var oldLogs = fs.readFileSync(file, 'utf8');

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
var arr = new Array();

lineReader.eachLine(file,function(line, last) {
    continueFrom += line.length;
    if(arr.length < 10) {
        arr.push(line);
    }
    else {
        arr.shift();
        arr.push(line);
    }
});

fs.watch(file, function(event, fname) {
  if (event == 'change') {
    var readStream = fs.createReadStream(file, {
      start: (continueFrom - 1)
    });
    var text = '';
    readStream.on('data', function(chunk) {

      text += chunk.toString();
    });
    readStream.on('end', function() {
	   continueFrom += text.length
      socket.emit('message',text);
    });
  }
});

var text = "";
socket.on('connection', function(socket) {
  emitPrevious(arr, socket)

});

var emitPrevious = function(logArr, socket) {
  logArr.forEach(function(log) {
  	socket.emit('message',log);
  });
}