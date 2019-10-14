const express = require('express');
const app = express();
const querystring = require('querystring');
const https = require('https');
const fs = require('fs');
const parseString = require('xml2js').parseString;

var casLogin = '/cas/login?'
var casVerify = '/cas/serviceValidate?'
var casServer = 'https://cas.nss.udel.edu'
var serviceURL = 'https://planner.cis.udel.edu:3000/'

var serviceURLQueryString = querystring.stringify({
    service: serviceURL
});

function verifyTicket(ticket) {
    var token = {};

    https.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log(JSON.parse(data).explanation);
            parseString(data, function (err, result) {
                token = JSON.stringify(result);
                console.log(token);
            });
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

    if (token.hasOwnProperty("cas:authenticationSuccess")) {
        token = token["cas:serviceResponse"]["$"]["xmlns:cas"]["cas:authenticationSuccess"];
    } else {
        token = {
            "message": "invalid ticket"
        };
    }

    return token;
}

app.get('/', function (req, res) {
    ticket = req.query.ticket;
    res.json(verifyTicket(ticket));
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