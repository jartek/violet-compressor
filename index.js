require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const rp = require('request-promise');
const http = require('http');
const randomColor = require('randomcolor');
const firebase = require("firebase");

const app = express();
const urlencodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_PROJECT_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID
};

firebase.initializeApp(config);
const storage = firebase.storage();
const database = firebase.database();

app.post('/travis', urlencodedParser, (req, res, next) => {});

app.post('/github', jsonParser, (req, res, next) => {
  const payload = req.body;

  console.log(payload);
  console.log(req.headers);

  switch (req.headers['x-github-event']) {
    case 'pull_request':
      res.send(`${payload.pull_request.user.login} ${payload.action} <${payload.pull_request.url}|${payload.pull_request.title}>`);

    case 'pull_request_review':
    case 'pull_request_review_comment':
      res.send(`${payload.pull_request.user.login} ${payload.review.state} <${payload.review.pull_request_url}|${payload.pull_request.title}>`);

    default:
      return false;
  }
});


app.get('/', (req, res) => {
  res.send('Hello world');
});

http.createServer(app).listen(process.env.PORT);
