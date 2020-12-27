// package: greeting
// file: proto/greeting_grpc.proto

var proto_greeting_grpc_pb = require("./greeting_grpc_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var GreetingService = (function () {
  function GreetingService() {}
  GreetingService.serviceName = "greeting.GreetingService";
  return GreetingService;
}());

GreetingService.Greeting = {
  methodName: "Greeting",
  service: GreetingService,
  requestStream: false,
  responseStream: false,
  requestType: proto_greeting_grpc_pb.GreetingRequest,
  responseType: proto_greeting_grpc_pb.GreetingResponse
};

exports.GreetingService = GreetingService;

function GreetingServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

GreetingServiceClient.prototype.greeting = function greeting(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(GreetingService.Greeting, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.GreetingServiceClient = GreetingServiceClient;

