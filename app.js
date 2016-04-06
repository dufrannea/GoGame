var express = require('express')
var app = express();
var config = require('./server/config')();
var server = require('http').Server(app);

var session = require('cookie-session');
var oauth2 = require('./server/oauth2')(config.oauth2);

app.use(session({
  secret: config.secret,
  signed: true
}));

// register oauth2 routes
app.use(oauth2.router);

// make all calls required.
app.use(oauth2.required);

app.get('/', function(req, res) {
    
    res.sendfile(__dirname + '/build/index.html');
});

// serve static files
app.use(express.static('build'));

require('./server/sockets')(server);

if (module === require.main) {
  // Start the server
  server.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}
