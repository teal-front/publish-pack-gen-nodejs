var amqp = require('amqp');
var uuid = require('node-uuid').v4;
var os = require('os');
var debug = require('debug')('amqp-rpc');
var definitions = require('../lib/definitions');
var methods = definitions.methods;
var classes = definitions.classes;
var queueNo = 0;

function rpc(opt) {
    if (!opt) opt = {};
    this.opt = opt;
    this.__conn = opt.connection ? opt.connection : null;
    this.__url = opt.url ? opt.url : 'amqp://guest:guest@localhost:5672';
    this.__exchange = opt.exchangeInstance ? opt.exchangeInstance : null;
    this.__exchange_name = opt.exchange ? opt.exchange : '';
    this.__exchange_options = opt.exchange_options ? opt.exchange_options : {
        exclusive: false,
        autoDelete: true
    };
    this.__impl_options = opt.ipml_options || {
        defaultExchangeName: this.__exchange_name
    };
    this.__conn_options = opt.conn_options || {};

    this.__results_queue = null;
    this.__results_queue_name = null;
    this.__results_cb = {};
    this.__make_results_cb = [];

    this.__cmds = {};

    this.__connCbs = [];
    this.__exchangeCbs = [];
}

rpc.prototype.generateQueueName = function(type) {
    return /*'njsListener:' +*/ os.hostname() + ':pid' + process.pid + ':' + type;
}

rpc.prototype._connect = function(cb) {
    if (!cb) {
        cb = function() {};
    }
    if (this.__conn) {
        if (this.__connCbs.length > 0) {
            this.__connCbs.push(cb);
            return true;
        }
        return cb(this.__conn);
    } else {
        this.__conn = this.opt.connection ? this.opt.connection : null;
    }

    var $this = this;

    this.__connCbs.push(cb);
    var options = this.__conn_options;
    if (!options.url) options.url = this.__url;
    debug("createConnection options=", options, ', ipml_options=', this.__impl_options || {});
    this.__conn = amqp.createConnection(
        options,
        this.__impl_options
    );

    this.__conn.on('ready', function() {
        debug("connected to " + $this.__conn.serverProperties.product);
        var cbs = $this.__connCbs;
        $this.__connCbs = [];

        for (var i = 0; i < cbs.length; i++) {
            cbs[i]($this.__conn);
        }
    });
}

rpc.prototype.disconnect = function() {
    debug("disconnect()");
    if (!this.__conn) return;
    this.__conn.end();
    this.__conn = null;
}

rpc.prototype._makeExchange = function(cb) {
    if (!cb) {
        cb = function() {};
    }
    if (this.__exchange) {
        if (this.__exchangeCbs.length > 0) {
            this.__exchangeCbs.push(cb);
            return true;
        }
        return cb(this.__exchange);
    }
    var $this = this;
    this.__exchangeCbs.push(cb);
    this.__exchange = this.__conn.exchange(this.__exchange_name, {
        autoDelete: false
    }, function(exchange) {
        debug('Exchange ' + exchange.name + ' is open');
        var cbs = $this.__exchangeCbs;
        $this.__exchangeCbs = [];

        for (var i = 0; i < cbs.length; i++) {
            cbs[i]($this.__exchange);
        }
    });
}

rpc.prototype._makeResultsQueue = function(cb) {
    if (!cb) {
        cb = function() {};
    }

    if (this.__results_queue) {
        if (this.__make_results_cb.length > 0) {

            this.__make_results_cb.push(cb);
            return true;
        }
        return cb(this.__results_queue);
    }

    var $this = this;

    //this.__results_queue_name = 'nodejs-rpc-callback';//this.generateQueueName('callback');
    this.__results_queue_name = this.generateQueueName('callback');
    this.__make_results_cb.push(cb);

    $this._makeExchange(function() {

        $this.__results_queue = $this.__conn.queue(
            $this.__results_queue_name,
            $this.__exchange_options,
            function(queue) {
                debug('Callback queue ' + queue.name + ' is open');
                queue.subscribe(function() {
                    $this.__onResult.apply($this, arguments);
                });

                queue.bind('#');
                //queue.bind($this.__exchange, $this.__results_queue_name);
                debug('Bind queue ' + queue.name + ' to exchange ' + $this.__exchange.name);
                var cbs = $this.__make_results_cb;
                $this.__make_results_cb = [];

                for (var i = 0; i < cbs.length; i++) {
                    cbs[i](queue);
                }
            }
        );
    });
}

rpc.prototype.__onResult = function(message, headers, deliveryInfo) {
    debug("__onResult()");
    if (!this.__results_cb[deliveryInfo.correlationId]) return;

    var cb = this.__results_cb[deliveryInfo.correlationId];

    var args = [];
    if (Array.isArray(message)) {

        for (var i = 0; i < message.length; i++) {
            args.push(message[i]);
        }
    } else args.push(message);

    args.push(cb.timestamp);

    cb.cb.apply(cb.context, args);

    if (cb.autoDeleteCallback !== false)
        delete this.__results_cb[deliveryInfo.correlationId];
}

rpc.prototype.call = function(cmd, params, cb, context, options) {
    debug('call()', cmd);
    var $this = this;

    if (!options) options = {};

    options.contentType = 'application/json';
    options.contentEncoding = 'utf-8';
    var corr_id = options.correlationId || uuid();

    this._connect(function() {
        if (cb) {
            $this._makeExchange(function() {
                $this._makeResultsQueue(function() {

                    $this.__results_cb[corr_id] = {
                        cb: cb,
                        context: context,
                        autoDeleteCallback: !!options.autoDeleteCallback,
                        timestamp: new Date().getTime()
                    };

                    options.mandatory = true;
                    options.replyTo = $this.__results_queue_name;
                    options.correlationId = corr_id;
                    //options.domain    = "localhost";

                    $this.__exchange.publish(
                        cmd,
                        params,
                        options,
                        function(err) {
                            if (err) {
                                delete $this.__results_cb[corr_id];
                                cb(err);
                            }
                        }
                    );
                });
            });
        } else {
            $this._makeExchange(function() {
                $this.__exchange.publish(
                    cmd,
                    params,
                    options
                );
            });
        }
    });
    return corr_id;
}

rpc.prototype.request = function(cmd, params, cb, context, options) {
    this.call(methods[cmd].serverId, this.buildRequestParams(cmd, params), function(message, timestamp) {
        var encoded_payload = unescape(message.data);
        var payload = JSON.parse(encoded_payload);
        var data = {
            code: payload.status === '00000' ? 0 : parseInt(payload.status, 10),
            data: payload.result,
            msg: payload.exception,
            timestamp: new Date().getTime() - timestamp
        };
        cb(data);
    }, context, options);
}

rpc.prototype.buildRequestParams = function(cmd, params) {
    var method = methods[cmd];
    var p = {
        "serviceId": method.serverId,
        //"method": method.name,
        //"parameters": [JSON.stringify(params)]
        "parameters": params
    };
    if (method.interfaceId)
        p["command"] = method.interfaceId + '.' + method.name;
    else
        p["command"] = method.identity + '.' + method.name;

    console.log(p);
    return p;
}

rpc.prototype.on = function(cmd, cb, context, options) {
    debug('on(), routingKey=%s', cmd);
    if (this.__cmds[cmd]) return false;
    options || (options = {});
    var $this = this;
    this._connect(function() {
        $this.__conn.queue(options.queueName || cmd, function(queue) {
            $this.__cmds[cmd] = {
                queue: queue
            };
            queue.subscribe(function(message, d, headers, deliveryInfo) {
                var cmdInfo = {
                    cmd: deliveryInfo.routingKey,
                    exchange: deliveryInfo.exchange,
                    contentType: deliveryInfo.contentType,
                    size: deliveryInfo.size
                };
                if (deliveryInfo.correlationId && deliveryInfo.replyTo) {
                    return cb.call(context, message, function(err, data) {
                        var options = {
                            correlationId: deliveryInfo.correlationId
                        }
                        $this.__exchange.publish(
                            deliveryInfo.replyTo,
                            Array.prototype.slice.call(arguments),
                            options
                        );
                    }, cmdInfo);
                } else
                    return cb.call(context, message, null, cmdInfo);
            });
            $this._makeExchange(function() {
                queue.bind($this.__exchange, cmd);
            });
        });
    });
    return true;
}

rpc.prototype.off = function(cmd) {
    debug('off', cmd);
    if (!this.__cmds[cmd]) return false;
    var $this = this;
    var c = $this.__cmds[cmd];

    function unsubscribe(cb) {
        if (c.ctag)
            c.queue.unsubscribe(c.ctag);
        if (cb)
            return cb();
    }

    function unbind(cb) {
        if (c.queue) {
            unsubscribe(function() {
                c.queue.unbind($this.__exchange, cmd);

                if (cb)
                    return cb();
            });
        }
    }

    function destroy(cb) {
        if (c.queue) {
            unbind(function() {
                c.queue.destroy()
                if (cb)
                    return cb();
            });
        }
    }

    destroy(function() {
        delete $this.__cmds[cmd];
    });
    return true;
}

rpc.prototype.callBroadcast = function(cmd, params, options) {
    var $this = this;
    options || (options = {});
    options.broadcast = true;
    options.autoDeleteCallback = options.ttl ? false : true;
    var corr_id = this.call.call(this, cmd, params, options.onResponse, options.context, options);
    if (options.ttl) {
        setTimeout(function() {
            //release cb
            if ($this.__results_cb[corr_id]) {
                delete $this.__results_cb[corr_id];
            }
            options.onComplete.call(options.context, cmd, options);
        }, options.ttl);
    }
}

rpc.prototype.onBroadcast = function(cmd, cb, context, options) {
    options || (options = {});
    options.queueName = this.generateQueueName('broadcast:q' + (queueNo++));
    return this.on.call(this, cmd, cb, context, options);
}

rpc.prototype.offBroadcast = rpc.prototype.off;

module.exports.amqpRPC = rpc;

module.exports.init = function(opt) {
    return new rpc(opt);
}
