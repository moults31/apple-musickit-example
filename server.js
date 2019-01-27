#!/usr/bin/env node
const express = require('express');
const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;
const publicDir = process.argv[2] || __dirname + '/public';
const path = require('path');

const sessionstorage = require("sessionstorage");

const bodyParser = require("body-parser");

const jwt = require('jsonwebtoken');
const fs = require('fs');

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/index.html'));
});

const private_key = fs.readFileSync('apple_private_key.p8').toString();

var am_key = process.env.APPLEMUSIC_KEY;
var am_tid = process.env.APPLEMUSIC_TEAMID;

const token = jwt.sign({}, private_key, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: am_tid,
  header: {
    alg: 'ES256',
    kid: am_key
  }
});

sessionstorage.setItem('usertoken', '')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/token', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({token: token}));
});

app.put('/token', function (req, res) {
  // Index page will load apple musickit automatically and issue a put request
  // to send the value of the music user token to here.
  // Store it in session storage so we can report it to python app later.
  sessionstorage.setItem('usertoken', req.body['usertoken']);
});

app.get('/usertoken', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var t = sessionstorage.getItem('usertoken').toString()

  if(t == '')
  {
    res.send("Not initialized");
  }
  else
  {
    // If we have the user token, send it now.
    res.send(JSON.stringify({usertoken: t}));
    server.close();
  }  
});

app.use(express.static(publicDir));

console.log('Listening at', publicDir, hostname, port);
server = app.listen(port, hostname);
