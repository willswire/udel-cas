const querystring = require('querystring');
const session = require('express-session');
const express = require('express');
const convert = require('xml-js');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();

var casLogin = '/cas/login?'
var casVerify = '/cas/serviceValidate?'
var casServer = 'https://cas.nss.udel.edu'
var serviceURL = 'https://planner.cis.udel.edu:3000/'

app.use(session({
    secret: 'planner',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
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
    try {
        const data = await verifyTicket(req.query.ticket);
        const jsonData = convert.xml2json(data, {
            compact: true,
            trim: true
        });
        res.type('application/json');
        res.send(jsonData);
        res.cookie('CASToken', jsonData, {
            maxAge: 900000,
            httpOnly: true
        });
    } catch (error) {
        console.error(error);
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
        console.log('API listening at: ' + serviceURL)
    });