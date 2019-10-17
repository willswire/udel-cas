const cookieSession = require('cookie-session');
const querystring = require('querystring');
const express = require('express');
const convert = require('xml-js');
var jwt = require('jsonwebtoken');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();

var casLogin = '/cas/login?';
var casVerify = '/cas/serviceValidate?';
var casServer = 'https://cas.nss.udel.edu';
var serviceURL = 'https://planner.cis.udel.edu:3000';

const PORT = 3000;

app.use(cookieSession({
    name: 'cas-session',
    keys: ['key1', 'key2']
}))

var serviceURLQueryString = querystring.stringify({
    service: serviceURL
});

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

async function verifyTicket(ticket) {
    try {
        const response = await axios.get(casServer + casVerify + serviceURLQueryString + '&ticket=' + ticket);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

app.get('/', async (req, res) => {
    if (isEmpty(req.query)) {
        res.redirect(302, '/login');
    } else {
        try {
            var data = await verifyTicket(req.query.ticket);
            var jsonData = convert.xml2json(data, {
                ignoreAttributes: true,
                compact: true,
                trim: true
            });
            var casCookie = jwt.sign(jsonData, 'planner');
            res.cookie(
                'cas_user',
                casCookie, {
                    expires: new Date(Date.now() + 2 * 604800000),
                    path: '/'
                }
            );
            res.redirect(302, 'https://planner.cis.udel.edu');
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
    .listen(PORT, function () {
        console.log('API listening at: ' + serviceURL);
    });