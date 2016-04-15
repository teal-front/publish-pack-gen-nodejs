var request = require('request');
var config = require('../config');

var __fetchUserStateViaOldSys = function (cookies) {
    var _cookies = [];
    for (var key in cookies) {
        _cookies.push(key + "=" + cookies[key]);
    }
    _cookies = _cookies.join(';');

    var url = config.passportHost + "/SignIn/GetCurrentUser";
    console.log(url);

    var options = {
        url: url,
        headers: {
            'Cookie': _cookies
        }
    };
    console.log(options);

    return new Promise(function (resolve, reject) {
        console.log("Validate user's login state via old system.");
        request(options, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                body = JSON.parse(body);
                console.log(body);
                resolve(body);
            }
        });
    });
};

var __checkLoginState = function (req) {
    if (req.cookies[".huize.com"]) {
        if (!req.session.user) {
            return __fetchUserStateViaOldSys(req.cookies)
                .then(function (result) {
                    if (result.Status === 1) {
                        req.session.user = result.Data;

                        return Promise.resolve(Promise.resolve({
                            result: true
                        }));
                    } else {
                        return Promise.resolve(Promise.resolve({
                            result: false
                        }));
                    }
                })
                .catch(function (err) {
                    return Promise.resolve(Promise.resolve({
                        result: false
                    }));
                });
        } else {
            return Promise.resolve({
                result: true
            });
        }
    } else {
        delete req.session.user;
        return Promise.resolve({
            result: false
        });
    }
};

module.exports = {
    checkLoginState: __checkLoginState
};
