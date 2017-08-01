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

app.post('/codeclimate', urlencodedParser, (req, res, next) => {
  const payload = req.body;
  const errorMessage = payload.data.attributes.issue.check_name
  const errorDescription = payload.data.attributes.issue.description
  const message = `<${payload.data.attributes.issue.details_url}|${errorMessage}> `
  res.send({ text: message });
});

app.post('/github', jsonParser, (req, res, next) => {
  const payload = req.body;
  let text;

  console.log(payload);
  console.log(req.headers);

  switch (req.headers['x-github-event']) {
    case 'pull_request':
      text = `${payload.pull_request.user.login} ${payload.action} <${payload.pull_request.url}|${payload.pull_request.title}>`;
      break;

    case 'pull_request_review':
    case 'pull_request_review_comment':
      text = `${payload.pull_request.user.login} ${payload.review.state} <${payload.review.pull_request_url}|${payload.pull_request.title}>`;
      break;
  }

  res.send({text: text});
});


app.get('/', (req, res) => {
  res.send('Hello world');
});

http.createServer(app).listen(process.env.PORT);
