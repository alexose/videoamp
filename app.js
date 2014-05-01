var http        = require("http")
  , https       = require("https")
  , url         = require("url")
  , fs          = require("fs")
  , querystring = require("querystring")
  , log         = require('npmlog')
  , dgram       = require("dgram");

log.enableColor();
log.level = 'verbose';

var args = process.argv || [];

var ports = {
    host:   args[2] || 3000,
    socket: args[3] || 8080
};

// Load minified scripts
var scripts;
try {
  scripts = fs.readFileSync('scripts.js.min');
} catch(e){
  log.error('Could not load client scripts.  Did you run "make" yet?');
}

http.createServer(function(request, response) {

  var dest = request.url.split('/').pop()
    , port = parseInt(dest, 10);


  if (isNaN(port)){

    explain(response);
  } else {

    serve(request, response, port);
  }

}).listen(ports.host, function(){
  log.info('Server running on port ' + ports.host);
});

function serve(request, response, port){

  // Serve static content
  try{
    fs.readFile('index.template', 'utf8', function(err, template){

      var host = request.headers.host.split(':').shift();

      var html = template
        .replace('{{ports.socket}}', ports.socket)
        .replace('{{ports.udp}}', port)
        .replace('{{host}}', host)
        .replace('{{scripts}}', scripts);

      respond(response, html);
    });
  } catch(e){
    respond(response, e.toString());
  }

}

// TODO
function explain(response){

  respond(response, 'Placeholder for a readme');
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
        log.info('Listening for video stream on port ' + address.address + ':' + address.port);
      });

      // Rebroadcast udp stream over socket
      udpSocket.on('message', function (msg, rinfo){
          ws.broadcast(msg, { binary : true } );
      });
    }
  });

  ws.on('close', function(){
    udpSocket.close();
    log.warning('Stopped listening for video.');
  });
});
