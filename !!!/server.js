/*-----------------------------------------------------------------------------
A bot for managing a users to-do list.  See the README.md file for usage 
instructions.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var index = require('./src/dialogs/index');

// Get secrets from server environment
var botConnectorOptions = {
    appId: 'MonsterJobSearchBot', // process.env.BOTID, 
    appSecret: 'xxa' //process.env.BOTSECRET
};

// Create bot and add dialogs
var bot = new builder.BotConnectorBot(botConnectorOptions);
bot.add('/', index);


// Setup Restify Server
var server = restify.createServer();

//server.use(
//    restify.CORS({
//        origins: [
//            '*'
//        ],
//        headers: [
//            "authorization",
//            "withcredentials",
//            "x-requested-with",
//            "x-forwarded-for",
//            "x-real-ip",
//            "x-customheader",
//            "user-agent",
//            "keep-alive",
//            "host",
//            "accept",
//            "connection",
//            "upgrade",
//            "content-type",
//            "dnt",
//            "if-modified-since",
//            "cache-control",
//            "Access-Control-Allow-Credentials"
//        ]
//    })
//);

//// Handle all OPTIONS requests to a deadend (Allows CORS to work them out)
//server.opts(/.*/, function(req, res) { res.send(204) });


server.use(restify.CORS());

// Lets try and fix CORS support
// By default the restify middleware doesn't do much unless you instruct
// it to allow the correct headers.
//
// See issues:
// https://github.com/mcavage/node-restify/issues/284 (closed)
// https://github.com/mcavage/node-restify/issues/664 (unresolved)
//
// What it boils down to is that each client framework uses different headers
// and you have to enable the ones by hand that you may need.
// The authorization one is key for our authentication strategy
//
restify.CORS.ALLOW_HEADERS.push("authorization");
restify.CORS.ALLOW_HEADERS.push("withcredentials");
restify.CORS.ALLOW_HEADERS.push("x-requested-with");
restify.CORS.ALLOW_HEADERS.push("x-forwarded-for");
restify.CORS.ALLOW_HEADERS.push("x-real-ip");
restify.CORS.ALLOW_HEADERS.push("x-customheader");
restify.CORS.ALLOW_HEADERS.push("user-agent");
restify.CORS.ALLOW_HEADERS.push("keep-alive");
restify.CORS.ALLOW_HEADERS.push("host");
restify.CORS.ALLOW_HEADERS.push("accept");
restify.CORS.ALLOW_HEADERS.push("connection");
restify.CORS.ALLOW_HEADERS.push("upgrade");
restify.CORS.ALLOW_HEADERS.push("content-type");
restify.CORS.ALLOW_HEADERS.push("content-length");
restify.CORS.ALLOW_HEADERS.push("pragma");
restify.CORS.ALLOW_HEADERS.push("dnt"); // Do not track
restify.CORS.ALLOW_HEADERS.push("if-modified-since");
restify.CORS.ALLOW_HEADERS.push("cache-control");
restify.CORS.ALLOW_HEADERS.push("referer");
restify.CORS.ALLOW_HEADERS.push("accept-encoding");
restify.CORS.ALLOW_HEADERS.push("accept-language");


// Manually implement the method not allowed handler to fix failing preflights
//
server.on("MethodNotAllowed", function (request, response) {
    if (request.method.toUpperCase() === "OPTIONS") {
        // Send the CORS headers
        //
        response.header("Access-Control-Allow-Credentials", true);
        response.header("Access-Control-Allow-Headers", restify.CORS.ALLOW_HEADERS.join(", "));
        response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.header("Access-Control-Allow-Origin", request.headers.origin);
        response.header("Access-Control-Max-Age", 0);
        response.header("Content-type", "text/plain charset=UTF-8");
        response.header("Content-length", 0);
        
        response.send(204);
    }
    else {
        response.send(new restify.MethodNotAllowedError());
    }
});




server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': './jb/',
    'default': 'index.html'
}));

server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

