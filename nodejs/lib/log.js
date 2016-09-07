var tracer = require('tracer');
var config = require('../config');

module.exports = {
    logger: tracer.colorConsole({level: config.log.level}),
    performanceLogger: tracer.dailyfile({
        root: config.log.dir,
        maxLogFiles: 10,
        logPathFormat: '{{root}}/performance.{{date}}.log',
        format: '[{{timestamp}}] [{{title}}] - {{message}}'
    })
};