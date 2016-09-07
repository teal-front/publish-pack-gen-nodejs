var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __fetchContacts = function (userId) {
    return new Promise(function (resolve, reject) {
        channel.getUserContacts([userId], function (result) {
            if (result.data) {
                resolve(result.data);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __removeContact = function (contactId) {
    return new Promise(function (resolve, reject) {
        channel.removeUserContacts([contactId], function (result) {
            if (result.code === 0) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchCustomerService = function (userId) {
    return new Promise(function (resolve, reject) {
        channel.getProductCustomerService([userId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchBalance = function (userId, currencyId) {
    return new Promise(function (resolve, reject) {
        channel.getUserBalanceByCurrency([userId, currencyId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchFrozenBalance = function (userId, currencyId) {
    return new Promise(function (resolve, reject) {
        channel.getUserFreezedBalanceByCurrency([userId, currencyId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __activeRedEnvelope = function (userId, redEnvelopeNo) {
    return new Promise(function (resolve, reject) {
        var redEnvelope = {
            voucherSerialNo: redEnvelopeNo
        };

        channel.activeUserRedEnvelope([redEnvelope, userId, null], function (result) {
            if (result.code === 0) {
                resolve(result.data || false);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchAddresses = function (userId) {
    return new Promise(function (resolve, reject) {
        channel.gethUserShipAddress([userId], function (result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __updateAddress = function (address) {
    return new Promise(function (resolve, reject) {
        channel.updateUserAddress([address], function (result) {
            if (0 === result.code) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    fetchContacts: __fetchContacts,
    removeContact: __removeContact,
    fetchCustomerService: __fetchCustomerService,
    fetchBalance: __fetchBalance,
    fetchFrozenBalance: __fetchFrozenBalance,
    activeRedEnvelope: __activeRedEnvelope,
    fetchAddresses: __fetchAddresses,
    updateAddress: __updateAddress
};