require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const rp = require('request-promise');
const randomColor = require('randomcolor');

const app = express();
const urlencodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

app.post('/travis', urlencodedParser, (req, res, next) => {});

app.post('/github', jsonParser, (req, res, next) => {});
