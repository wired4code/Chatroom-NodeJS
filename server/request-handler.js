var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, //
  "Content-Type": "application/json"
};

var sendResponse = function(response, data, statusCode){
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var collectData = function(request, cb){
  var data = "";

  request.on('data', function(chunk){
    data += chunk;
  });

  request.on('end', function(){
    cb( JSON.parse(data) );
  });
};

var objectID = 1;

var messages = [
  {
    username: 'Joe',
    text: 'Hello World',
    objectID: objectID,
    roomname: 'all'
  }
];

module.exports = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

    if(request.method === "POST"){
      collectData(request, function(message){
        messages.push(message);
        message.objectID = ++objectID;
        sendResponse(response,{objectID: objectID});
      });
   }

    if(request.method === "GET"){
      sendResponse(response, {results: messages});
    }

    if(request.method === "OPTIONS"){
      sendResponse(response, null);
    }
};


