const cookieSession = require('cookie-session');
const querystring = require('querystring');
const express = require('express');
const convert = require('xml-js');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();

var casLogin = '/cas/login?';
var casVerify = '/cas/serviceValidate?';
var casServer = 'https://cas.nss.udel.edu';
var serviceURL = 'https://planner.cis.udel.edu:3000/';

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

var serviceURLQueryString = querystring.stringify({
    service: serviceURL
});

async function verifyTicket(ticket) {
    try {
        const response = await axios.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

app.get('/', async (req, res) => {
    console.log(req.query);
    if (req.query === undefined) {
        res.redirect(302, '/login');
    } else {
        try {
            const data = await verifyTicket(req.query.ticket);
            const jsonData = convert.xml2json(data, {
                compact: true,
                trim: true
            });
            res.type('application/json');
            res.send(jsonData);
        } catch (error) {
            console.error(error);
        }
    }
})

app.get('/login', function (req, res) {
    res.redirect(302, casServer + casLogin + serviceURLQueryString);
});

https.createServer({
        key: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.key'),
        cert: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.pem')
    }, app)
    .listen(3000, function () {
        console.log('API listening at: ' + serviceURL);
    });