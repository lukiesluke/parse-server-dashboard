
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

//request parameters:
//- registrationIDs: JPush registration ID's to send the notifications to, if empty sends to all
//-title: notification title
//-message: notification message

Parse.Cloud.define("sendNotifications", function (request, response) {
  console.log('sendNotifications called: %j', request);
  var query = new Parse.Query('Installation')
  if (request.params.registrationIDs) {
      query.containedIn('JPushRegistrationID', [request.params.registrationIDs]);
  }

  var data = {}
  if (request.params.title) {
      data.title = request.params.title
  }
  if (request.params.message) {
      data.message = request.params.message
  }

  Parse.Push.send({
      where: query,
      data: data
  }, { useMasterKey: true })
      .then((result) => {
          console.log('push sent with result: %j', result);
          response.success(result);
      }, (error) => {
          console.log('error sending push: %j', error);
          response.error(error)
      });
});