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

async function convertToken(token) {
    var newToken = {
        "status": "unauthenticated"
    };
    await xml2js.parseStringPromise(token).then(function (result) {
            newToken = JSON.stringify(result);
            console.dir(newToken);
            console.log('Done');
            return newToken;
        })
        .catch(function (error) {
            console.error(error);
        });
}

async function verifyTicket(ticket) {
    try {
        const response = await axios.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket);
        //const token = await convertToken(response.data);
        //return token;
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

app.get('/', async (req, res, next) => {
    try {
        const data = await verifyTicket(req.query.ticket);
        res.send(data);
    } catch (error) {
        console.error(error);
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