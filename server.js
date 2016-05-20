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

server.use(
    restify.CORS()
);

server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

