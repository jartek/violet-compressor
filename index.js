const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const rp = require('request-promise');
const http = require('http');
const randomColor = require('randomcolor');

require('dotenv').config();
require('http');

const app = express();
const urlencodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

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
