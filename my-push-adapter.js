
var JPush = require("jpush-sdk")

var jPushAppKey = '350689967e185dbd468c9b3a';
var jPushMasterKey = 'd05087000edb287181ee1fdf';

function JPushAdapter() {
    this._client = JPush.buildClient(jPushAppKey, jPushMasterKey);
    console.log('create JPushAdapter');
}

JPushAdapter.prototype.send = function (data, installations) {
    console.log('installation: %j', installations)
    var registrationIDs = []
    for (var index = 0; index < installations.length; index++) {
        const installation = installations[index];
        if (installation.JPushRegistrationID) {
            registrationIDs.push(installation.JPushRegistrationID)
        }
    }

    if(registrationIDs.length == 0) {
        return Promise.resolve('no ids to resolve')
    }

    var startDate = Date();
    return new Promise((resolve, reject) => {
        this._client.push()
            .setPlatform(JPush.ALL)
            .setAudience(JPush.registration_id(registrationIDs))
            // .setAudience(JPush.ALL)
            .setNotification(data.data.title + '\n' + data.data.message)
            .send(function (err, res) {

            console.log('push done from %s to %s', startDate.toString(), Date().toString());
                if (err) {
                    console.log(err.message)
                    resolve({error: err});
                } else {
                    resolve(res);
                }
            });
    });
}

JPushAdapter.prototype.getValidPushTypes = () => {
    return ['ios', 'android'];
}

module.exports = JPushAdapter
module.exports.default = JPushAdapter