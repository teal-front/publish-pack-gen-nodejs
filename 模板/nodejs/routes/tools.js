var express = require('express');
var router = express.Router();

router.get("/date/now", function (req, res, next) {
    var body = {
        status: "00000",
        result: new Date().toLocaleString(),
        success: true,
        error: false
    };

    res.status(200)
        .send(body);
});

module.exports = router;
