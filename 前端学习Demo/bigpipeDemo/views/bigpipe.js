

window.Bigpipe = function () {
    this.callbacks = {};
}

Bigpipe.prototype.ready = function (id, callback) {
    if (Object.prototype.toString.apply(id) === "[object Array]") {
        for (var i = 0; i < id.length; i++) {
            arguments.callee.call(this, id[i], callback);
        }
    }

    if (!this.callbacks[id]) {
        this.callbacks[id] = [];
    }
    this.callbacks[id].push(callback);
}

Bigpipe.prototype.set = function (id, data) {
    var callbacks = this.callbacks[id] || [];
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].call(this,data);
    }
}