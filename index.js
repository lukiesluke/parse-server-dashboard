// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

// var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var databaseUri = 'mongodb://localhost:27017/dev-test';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var JPushAdapter = require('./my-push-adapter.js');
const pushAdapter = new JPushAdapter() //custom adapter to use jpush for push notifications

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'my-app-id',
  masterKey: process.env.MASTER_KEY || 'master-key', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://192.168.3.108:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push: {
    adapter: pushAdapter
  }
});

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://192.168.3.108:1337/parse",// use "localhost" or change to host IP to allow remote access
      "appId": "my-app-id",
      "masterKey": 'master-key',
      "appName": 'MyParseServer'
    }
  ],
  //username and passwords to access dashboard
  "users": [
      {
          "user": "user", 
          "pass": "pass"
      }
  ]
}, true);

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);