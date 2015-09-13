var http = require('http');
var fs = require("fs");

var Eventproxy = require("eventproxy");
var proxy = new Eventproxy();

var layoutCahce = {};
var layout = "index.html";

http.createServer(function (req, res) {
    if (!layoutCahce[layout]) {
        layoutCahce[layout] = fs.readFileSync("./views/" + layout, "utf8");
    }

    res.writeHead(200, { "Content-Type": "text/html" });

    res.write(layoutCahce[layout]);
   
    proxy.all(["header", "nav", "section", "footer"], function () {
        res.end();
    });


    setTimeout(function () {
        res.write('<script>bigPipe.set("header","<h1>headerData</h1>")</script>');
        proxy.emit("header");
    }, 1000);
    setTimeout(function () {
        res.write('<script>bigPipe.set("nav","<h1>navData</h1>")</script>');
        proxy.emit("nav");
    }, 2000);
    setTimeout(function () {
        res.write('<script>bigPipe.set("section","<h1>sectionData</h1>")</script>');
        proxy.emit("section");
    }, 3000);
    setTimeout(function () {
        res.write('<script>bigPipe.set("footer","<h1>footerData</h1>")</script>');
        proxy.emit("footer");
    }, 4000);
   

}).listen(8000);

