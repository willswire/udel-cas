const express = require('express');
const app = express();
const querystring = require('querystring');
var https = require('https');
var fs = require('fs');

var casLogin = '/cas/login?'
var casVerify = '/cas/serviceValidate?'
var casServer = 'https://cas.nss.udel.edu'
var serviceURL = 'https://planner.cis.udel.edu:3000/'

var serviceURLQueryString = querystring.stringify({
    service: serviceURL
});

function verifyTicket(ticket) {
    https.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

app.get('/', function (req, res) {
    if (req.query.ticket !== {}) {
        ticket = req.query.ticket;
        verifyTicket(ticket);
    } else {
        res.json({
            "message": "not logged in"
        });
    }
})

app.get('/validate', function (req, res) {
    res.redirect(302, casServer + casLogin + serviceURLQueryString);
});

https.createServer({
        key: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.key'),
        cert: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.pem')
    }, app)
    .listen(3000, function () {
        console.log('App listening on port 3000! Go to: ' + serviceURL)
    });