var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __caculateAmount = function (params) {
    return new Promise(function (resolve, reject) {
		channel.caculateProgramPrice([params], function (result) {
			if (0 === result.code) {
				resolve(result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
    });
};

var __collect = function (userId, programId) {
	 return new Promise(function (resolve, reject) {
		channel.collectProgram([programId, userId], function (result) {
			if (0 === result.code) {
				resolve(!!result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
    }); 
};

var __uncollect = function (userId, programId) {
	return new Promise(function (resolve, reject) {
		channel.cancelCollectProgram([programId, userId], function (result) {
			if (0 === result.code) {
				resolve(!!result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
    }); 
};

var __isCollected = function (userId, programId) {
	return new Promise(function (resolve, reject) {
		channel.checkProgramIsCollected([programId, userId], function (result) {
			if (0 === result.code) {
				resolve(!!result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
    }); 
};
var __getComments = function(projectId, pageSize, pageIndex) {
	return new Promise(function(resolve, reject) {
		channel.getPlanComments([projectId, {pageSize: pageSize, pageIndex: pageIndex}], function (result) {
			if (0 === result.code) {
				resolve(result.data);
			} else {
				reject(new RpcError(result.code, result.msg));
			}
		});
	});
};
module.exports = {
    caculateAmount: __caculateAmount,
	collect: __collect,
	uncollect: __uncollect,
	isCollected: __isCollected,
	getComments : __getComments
};