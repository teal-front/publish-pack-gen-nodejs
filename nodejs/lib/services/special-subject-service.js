var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __findOne = function (url) {
    return new Promise(function (resolve, reject) {
		channel.getSpecialSubjectByUrl([url], function (result) {
			if (0 === result.code) {
				resolve(result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
    });
};

var __findAll = function () {
	return new Promise(function (resolve, reject) {
		channel.getSpecialSubjects([], function (result) {
			if (0 === result.code) {
				resolve(result.data || []);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
	});
};

module.exports = {
    findOne: __findOne,
	findAll: __findAll
};