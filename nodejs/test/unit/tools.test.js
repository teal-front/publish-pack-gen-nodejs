var should = require('should');
var request = require('supertest');

describe('/tools', function () {
    it('/address/province', function (done) {
        var path = '/api/tools/address/province';
        
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
    
    it('/address/city', function (done) {
        var province = 610000;
        var path = '/api/tools/address/city?province=' + province;
        
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
    
    it('/address/district', function (done) {
        var city = 610800;
        var path = '/api/tools/address/district?city=' + city;
        
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
    
    it('/airports', function (done) {
        var path = '/api/tools/airports';
        
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