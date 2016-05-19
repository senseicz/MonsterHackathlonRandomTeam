var restify = require('restify');

var client = restify.createJsonClient({
    url: 'https://gateway.monster.com',
    headers: { 'x-domain': 'mobileservice.monster.com' },
});

client.get('/seeker/mobile/jobs/166363399/body?stripHtml=true&ver=2', function(err, req, res, obj) {


    var body = obj.Data.Body;
    
    var i, str = '';
    
    for (i = 0; i < body.length; i++) {
        str += '%' + ('0' + body[i].toString(16)).slice(-2);
    }
    str = decodeURIComponent(str);
    
    console.log(str);

});