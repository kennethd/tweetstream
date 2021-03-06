var express = require('express');
var http = require('http');
var twitter = require('twitter');
var config = require('./config.json');

var twit = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var express = require("express");
var app = express();

app.set('view engine', 'html');
app.set('layout', 'layout');
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.use(express.static(__dirname + '/public'));
var server = http.createServer(app);
server.listen(process.env.PORT || 7080);

var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
  res.render('index');
});

var bannedWords = config.bannedWords.join('|');

twit.stream('statuses/filter', { track: config.keyword }, function(stream) {
  stream.on('data', function(data) {
    var containsBannedWord = new RegExp(bannedWords, 'i').test(data.text) === true;
    if (!containsBannedWord) {
      io.sockets.emit('tweet', { tweet: data });
    }
  });
});
