var should = require('should');
var request = require('supertest');

describe("/users", function() {
    it("GET /islogin", function(done) {
        var path = "/users/islogin";

        request(host)
            .get(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body);
                    done();
                }
            });
    });

    it("GET /customer-service", function(done) {
        var userId = 1;
        var path = "/users/customer-service";

        request(host)
            .get(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    should(body).be.an.obejct;
                    should(body.result).have.properties(["qq", "phone", "name"]);
                    done();
                }
            });
    });

    it('GET /contacts', function (done) {
        var userId = 247744;
        var path = '/users/contacts';

        request(host)
            .get(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body);
                    done();
                }
            });
    });

    it('DELETE /contacts/:contactId', function (done) {
        var userId = 247499;
        var contactId = 11;
        var path = '/users/contacts/' + contactId;

        request(host)
            .delete(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });

    it('GET /balance', function (done) {
        var userId = 247499;
        var currencyId = 1003;
        var path = '/users/balance?currencyId=' + currencyId;
        var cookies = "pgv_pvi=1917646848; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; userId=lKVrGsbz1ek%3d; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html\"}; pgv_si=s9526481920; bdshare_firstime=1460346331980; Product_History=20024; __jsluid=f4491978257186b5fb72ca67b5cbe9d3; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460447165494_5_sOg7DUdLHZ2ETvmE0r6BkqXJaUaHZ2aZNq9WAh_1460447165507_http%25253A%25252F%25252Fwww.huize.com%25252F; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1460447168; _ga=GA1.2.674699184.1460447166; .huize.com=DF0C598472E8861F9A7769B2E88F0650828F33FAB4CCA605CD71D2F313237103690B780F17FCB643C225AB13EB69881E300A92D550CCBF150C8E9205CB71B39E2572D07B351CC81638C8D48271101BEAD3FBEE99B2A50C4A0F388616D68D76413FFB544C4011CCC557211DB94431EC0FB0A42AE9939626DC1E1CFC44D0C3C4022B08D4E50218C0DA5DB25D0771121589AB48A48ADA6965216B2655E32BE5BEAAB0D63902";
        
        request(host)
            .get(path)
            .set('Cookie', cookies)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });

    it('GET /freezed-balance', function (done) {
        var userId = 247499;
        var currencyId = 1;
        var path = '/users/freezed-balance?currencyId=' + currencyId;

        request(host)
            .get(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });

    it('POST /red-envelopes', function (done) {
        var userId = 247499;
        var path = '/users/red-envelopes';
        var requestBody = {
            insuranceSlipIds: [20160401001539]
        };

        request(host)
            .post(path)
            .send(requestBody)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });

    it('POST /active-red-envelope', function (done) {
        var userId = 247499;
        var path = '/users/active-red-envelope';
        var requestBody = {
            redEnvelopeId: 1
        };

        request(host)
            .post(path)
            .send(requestBody)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });

    it('GET /addresses', function (done) {
        var userId = 247499;
        var path = '/users/addresses';

        request(host)
            .get(path)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    done();
                }
            });
    });
});
