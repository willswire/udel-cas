const express = require('express');
const app = express();
const querystring = require('querystring');
var https = require('https');
var fs = require('fs');

var casLogin = '/cas/login?'
var casServer = 'https://cas.nss.udel.edu'
var serviceURL = 'https://planner.cis.udel.edu:3000/'

var serviceQueryString = querystring.stringify({
    service: serviceURL
});

app.get('/', function (req, res) {
    res.json({
        "message": "endpoint reached"
    })
})

app.get('/validate', function (req, res) {
    res.redirect(302, casServer + casLogin + serviceQueryString);
});

https.createServer({
        key: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.key'),
        cert: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.pem')
    }, app)
    .listen(3000, function () {
        console.log('App listening on port 3000! Go to: ' + serviceURL)
    });