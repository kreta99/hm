var express = require('express');
var app = express();
var path = require('path');

var qsocks = require('qsocks');
var fs = require('fs');
var request = require('request');
var open = require('open');

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/selectuser.html'));
});

app.get('/login', function (req, res) {
    var selectedUser = req.query.selectedUser;
    //var id = req.query.id;
	var userDir = req.query.userDirectory;
	console.log('Preparing data for user: ' + selectedUser);
	
app.get('/hm', function(req, res) {
    res.sendFile(path.join(__dirname + '/hm.html'));
});
	
	
//  Set our request defaults, ignore unauthorized cert warnings as default QS certs are self-signed.
//  Export the certificates from your Qlik Sense installation and refer to them
var r = request.defaults({
  rejectUnauthorized: false,
  host: 'qlik-sense',
  pfx: fs.readFileSync('cert\\client.pfx')
})


//  Authenticate whatever user you want
var b = JSON.stringify({
  "UserDirectory": userDir,
  "UserId": selectedUser,
  "Attributes": []
});

//  Get ticket for user - refer to the QPS API documentation for more information on different authentication methods.
r.post({
  uri: 'https://qlik-sense:4243/qps/ticket?xrfkey=abcdefghijklmnop',
  body: b,
  headers: {
    'x-qlik-xrfkey': 'abcdefghijklmnop',
    'content-type': 'application/json'
  }
},
function(err, res, body) {

  //  Consume ticket, set cookie response in our upgrade header against the proxy.
  var ticket = JSON.parse(body)['Ticket'];
  r.get('https://qlik-sense/hub/?qlikTicket=' + ticket, function(error, response, body) {

    var cookies = response.headers['set-cookie'];
	console.log('User ticket: ' + ticket + ' cookie: ' + cookies[0]);
	
	var config = {
      host: 'qlik-sense',
      isSecure: true,
      origin: 'http://localhost',
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies[0]
      }
    }
	
	qsocks.Connect(config).then(function(global) {
		// do required operation  on server here ex data preparation, reload
		
	})
	
  })

});

res.redirect('/hm');
	
});

app.listen(3000, function () {
  console.log('Listening on port 3000')
})