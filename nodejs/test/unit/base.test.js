var request = require('supertest');
var should = require('should');

describe('/base', function () {
    it('GET /simple-market-data', function (done) {
        var path = '/api/base/simple-market-data';

        request(host)
            .get(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body);
                    done();
                }
            });
    });
});