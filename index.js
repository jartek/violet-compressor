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
    const payload = req.body;
    let text;
    let username;
    let pullRequestUrl;
    let pullRequestTitle;
    let action;
    let reviewState;
    let commentUrl;
    switch (req.headers['x-github-event']) {
      // case 'pull_request':
      //   username = payload.review.user.login;
      //   pullRequestUrl = payload.pull_request.url;
      //   pullRequestTitle = payload.pull_request.title;
      //   action = payload.action;
      //   username = payload.pull_request.user.login;

      //   text = `*[PR created]* <@${username}> ${action} <${pullRequestUrl}|${pullRequestTitle}>`;

      //   break;

      case 'pull_request_review':
        reviewer = payload.review.user.login;
        username = payload.pull_request.user.login;
        reviewState = payload.review.state;
        commentUrl = payload.review.html_url;
        commentBody = payload.review.body;
        pullRequestTitle = payload.pull_request.title;

        text = `*[PR Reviewed]:* <@${reviewer}> ${reviewState} on <${commentUrl}|${pullRequestTitle}> with: \n` + '```' + commentBody + '```';

        break;

      case 'pull_request_review_comment':
        commentUrl = payload.comment.html_url;
        commentBody = payload.comment.body;
        pullRequestTitle = payload.pull_request.title;
        commenter = payload.comment.user.login;
        username = payload.pull_request.user.login;

        text = `*[PR Reviewed]:* <@${commenter}> commented on <${commentUrl}|${pullRequestTitle}> with: \n` + '```' + commentBody + '```';

        break;
      }

      return rp({
        uri: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        json: true,
        qs: {
          token: process.env.OAUTH_TOKEN,
          channel: result[username],
          text: text
        }
      });

      res.send('');
    })
});

app.get('/', (req, res) => {
  res.send('Hello world');
});

http.createServer(app).listen(process.env.PORT);
