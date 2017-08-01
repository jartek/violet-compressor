require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const rp = require('request-promise');
const http = require('http');
const randomColor = require('randomcolor');

const app = express();
const urlencodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

function githubToChannelMapping() {
  return Promise.all([fetchSlackUsers(), fetchSlackChannels()]).then((results) => {
    const slackUsers = results[0],
      slackChannels = results[1];
    let github = {};

    userProfiles = slackUsers.members.map((user) => {
      return fetchSlackUserProfile.call(this, user.id)
    });

    return Promise.all(userProfiles).then((results) => {
      userProfiles = results.map((profile) => {
        if(profile.fields !== null) {
          githubId = profile.fields['Xf6GB5UW5Q'];
          if(githubId !== undefined) {
            slackChannel = slackChannels.ims.find((channel) => profile.user_id === channel.user)
            github[githubId.value] = slackChannel.id;
          }
        }
      });

      return github;
    });
  });
}

function fetchSlackUserProfile(userId) {
  return rp({
    uri: 'https://slack.com/api/users.profile.get',
    method: 'GET',
    json: true,
    qs: {
      token: process.env.OAUTH_TOKEN,
      user: userId
    }
  }).then((body) => {
    return Object.assign({}, body.profile, { user_id: userId });
  });
}

function fetchSlackChannels(){
  return rp({
    uri: 'https://slack.com/api/im.list',
    method: 'GET',
    json: true,
    qs: {
      token: process.env.OAUTH_TOKEN
    }
  }).then((body) => {
    return body;
  });
}

function fetchSlackUsers(){
  return rp({
    uri: 'https://slack.com/api/users.list',
    method: 'GET',
    json: true,
    qs: {
      token: process.env.OAUTH_TOKEN
    }
  }).then((body) => {
    return body;
  });
}

app.post('/travis', urlencodedParser, (req, res, next) => {});

app.post('/github', jsonParser, (req, res, next) => {
  githubToChannelMapping().then((result) => {
    console.log(result);
    const payload = req.body;
    let text;
    const username = payload.pull_request.user.login;
    let pullRequestUrl;
    let pullRequestTitle;
    let action;
    let reviewState;
    let commentUrl;

    switch (req.headers['x-github-event']) {
      case 'pull_request':
        pullRequestUrl = payload.pull_request.url;
        pullRequestTitle = payload.pull_request.title;
        action = payload.action;

        text = `*[PR created]* <@${username}> ${action} <${pullRequestUrl}|${pullRequestTitle}>`;

        break;

      case 'pull_request_review':
      case 'pull_request_review_comment':
        reviewState = payload.review.state;
        commentUrl = payload.review.html_url;
        pullRequestTitle = payload.pull_request.title;

        text = `*[PR Reviewed]:* <@${username}> ${reviewState} <${commentUrl}|${pullRequestTitle}>`;

        break;
      }
    })

  res.send('');
});

app.get('/', (req, res) => {
  res.send('Hello world');
});

http.createServer(app).listen(process.env.PORT);
