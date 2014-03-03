var http        = require("http")
  , https       = require("https")
  , url         = require("url")
  , fs          = require("fs")
  , querystring = require("querystring")
  , dgram       = require("dgram");

var args = process.argv || [];

var ports = {
    host:   args[2] || 3000,
    socket: args[3] || 8080
};

http.createServer(function(request, response) {

  var dest = request.url.split('/').pop()
    , port = parseInt(dest, 10);

  if (isNaN(port)){

    explain(response);
  } else {

    serve(request, response, port);
  }

}).listen(ports.host, function(){
  console.log('Server running on port ' + ports.host);
});

function serve(request, response, port){

  // Serve static content
  try{
    fs.readFile('index.template', 'utf8', function(err, template){

      var host = request.headers.host.split(':').shift();

      var html = template
        .replace('{{ports.socket}}', ports.socket)
        .replace('{{ports.udp}}', port)
        .replace('{{host}}', host);

      respond(response, html);
    });
  } catch(e){
    respond(response, 'Could not find Sieve library.  Did you run npm install?');
  }

}

// TODO
function explain(response){

  respond(response, 'Hello');
}

function respond(response, string, type, code){

  type = type || 'text/html';
  code = code || 200;

  response.writeHead(code, {
    'Content-Type': type
  });
  response.write(string);
  response.end();
}

// Set up Websocket
var WebSocket = require('ws').Server
  , wss = new WebSocket({port: ports.socket});

/* Broadcast helper
ws.broadcast = function(data, options) {
  for(var i in this.clients){
    this.clients[i].send(data, options);
  }
};
*/

wss.on('connection', function(ws){

  // Create UDP socket
  var udpSocket = dgram.createSocket("udp4");

  ws.on('message', function(data, flags){

    var arr  = data.split(':')
      , name = arr[0];

    // Handle listen request
    if (name == 'listen'){

      udpSocket.bind(arr[1]);

      // UDP Welcome
      udpSocket.on('listening', function(){
        var address = udpSocket.address();
        console.log('Listening for video stream on port ' + address.address + ':' + address.port);
      });

      // Rebroadcast udp stream over socket
      udpSocket.on('message', function (msg, rinfo){
          ws.broadcast(msg, { binary : true} );
      });
    }
  });

  ws.on('close', function(){
    udpSocket.close()
    console.log('Stopped listening for video.');
  })
});
