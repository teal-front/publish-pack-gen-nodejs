'use strict';

var protocol = require('./channel-definitions');

var methodTable = {};

var methods = {};

var classes = {};

(function() {
    for (var i = 0; i < protocol.classes.length; i++) {
        var classInfo = protocol.classes[i];
        classes[classInfo.index] = classInfo;

        for (var j = 0; j < classInfo.methods.length; j++) {
            var methodInfo = classInfo.methods[j];

            var name = classInfo.name + '.' + methodInfo.name;

            var method = {
                name: methodInfo.name,
                serverId: classInfo.serverId,
                interfaceId: classInfo.interfaceId,
                identity: classInfo.identity
            };

            if (!methodTable[classInfo.index]) methodTable[classInfo.index] = {};
            methodTable[classInfo.index][methodInfo.index] = method;
            methods[name] = method;
        }
    }
})();

module.exports = {
    methods: methods,
    classes: classes,
    methodTable: methodTable
};