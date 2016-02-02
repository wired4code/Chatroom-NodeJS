var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, //
  "Content-Type": "application/json"
};


exports.requestHandler = function(request, response) {
  var results = [];
  console.log("Serving request type " + request.method + " for url " + request.url);


  var statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);

  if(request.url !== "/classes/messages" && request.url !== '/classes/room1'){
    response.writeHead(404, headers);
    response.end('Error message');
  } else {

    if(request.method === "POST"){
      response.writeHead(201, headers);
      var body = '';
      request.on('data', function(chunk) {
        body+=chunk;
      }).on('end', function() {
        body = JSON.parse(body);
        results.push(body);
      });
    }

    if(request.method === "GET"){
      response.writeHead(200, headers);
      var messages = JSON.stringify(results);
      //response.end('{"results": messages}');
      response.end('{"username": "Jono","message": "Do my bidding!", "results": []}');
    }

    if(request.method === "OPTIONS"){
      response.writeHead(200, headers);
      response.end('{"roomName":"lobby", "results": []}');
    }
  }


};


