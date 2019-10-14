const xml2js = require('xml2js');
const querystring = require('querystring');
const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();

var casLogin = '/cas/login?'
var casVerify = '/cas/serviceValidate?'
var casServer = 'https://cas.nss.udel.edu'
var serviceURL = 'https://planner.cis.udel.edu:3000/'

var serviceURLQueryString = querystring.stringify({
    service: serviceURL
});

async function verifyTicket(ticket) {
    var token = {
        "message": "invalid ticket"
    };

    try {
        const response = await axios.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket);
        await xml2js.parseStringPromise(response.data).then(function (result) {
            token = JSON.stringify(result);
            console.log(token);
        });
    } catch (error) {
        console.error(error);
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