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

app.use(
    restify.CORS({
        origins: [
            '*'
        ],
        headers: [
            "authorization",
            "withcredentials",
            "x-requested-with",
            "x-forwarded-for",
            "x-real-ip",
            "x-customheader",
            "user-agent",
            "keep-alive",
            "host",
            "accept",
            "connection",
            "upgrade",
            "content-type",
            "dnt",
            "if-modified-since",
            "cache-control"
        ]
    })
);

// Handle all OPTIONS requests to a deadend (Allows CORS to work them out)
app.opts(/.*/, function(req, res) { res.send(204) });

server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

