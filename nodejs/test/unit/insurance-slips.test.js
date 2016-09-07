var request = require('supertest');
var should = require('should');
var insuranceSlipsData = require('./insurance-data');
insuranceSlipsData.applicantPersonInfo.cardNumber = new Date().getTime();
insuranceSlipsData.insuredPersonInfoList[0].cardNumber = new Date().getTime();

describe('/insurance-slips', function () {
    it('POST /', function (done) {
        var path = "/api/insurance-slips";
        var requestBody = {
            data: JSON.stringify([insuranceSlipsData])
        };

        request(host)
            .post(path)
            .send(requestBody)
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

    it('POST /:id/start-date', function (done) {
        var insuranceSlipsId = 20160426002431;
        var path = '/api/insurance-slips/' + insuranceSlipsId + '/start-date';
        var requestBody = {
            data: JSON.stringify( {
                insureNum: insuranceSlipsId,
                startDate: '2016-03-30'
            })
        };

        request(host)
            .put(path)
            .send(requestBody)
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

    it('PUT /:id', function (done) {
        var insuranceSlipsId = 20160429001114;
        var path = '/api/insurance-slips/' + insuranceSlipsId;
        var cookies = "Product_History=20024%2C337; sid=s%3AgCm7Ezbab3Wr-boH19S-xm_nxYk3rI46.qZQQQrXzMQZjFcemkAPRUe%2FJWO0HkVq%2BPPqflbHZTmA; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fdemandanalysis%2fhome\"}; pgv_pvi=3045168128; pgv_si=s2171011072; Hm_lvt_8a32affef2f860a73caf9d05780da361=1461723724,1461823029,1462255185,1462411444; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1462417081; .huize.com=FA477B6D06085757BD3E2CAD6AC492B5A9FF1750EE786303782A4399DF225A208837F38CC1312CB2C40895D209A578F4CCB8A09E2A5A1D174F92FA1B18A6C4A79418440CF7AB6257222AC9470EB30F6DC2AE73EC81300BCE3482BA151AC62F1911C80B9C4119F0D6248F2BBBAFE207960FA6A199DE55EEFE8783A3B4C214B393A2C6C1D30BCBE65A5C4576E76F02D3472F3B1A0C8C87DAA5868DBCCA68438DFA48552A82; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        insuranceSlipsData.insureNum = insuranceSlipsId;
        var requestBody = {
            data: JSON.stringify(insuranceSlipsData)
        };
        console.log(requestBody);
        
        request(host)
            .put(path)
            .set('Cookie', cookies)
            .send(requestBody)
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

    it('GET /:id', function (done) {
        var insuranceSlipsId = 20160401001539;
        var path = '/api/insurance-slips/' + insuranceSlipsId;

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

    it('GET /:id/health-inform', function (done) {
        var insuranceSlipsId = 20160602001276;
        var path = '/api/insurance-slips/' + insuranceSlipsId + '/health-inform';

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

    it('POST /:id/health-inform', function (done) {
        var insuranceSlipsId = 20160401001539221;
        var path = '/api/insurance-slips/' + insuranceSlipsId + '/health-inform';
        var requestBody = {
            data: 'answer'
        };

        request(host)
            .post(path)
            .send(requestBody)
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

    it('GET /group-orders', function (done) {
        var fileId = 20160401001539;
        var path = '/api/insurance-slips/groups/parse-excel?fileId=' + fileId;

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

    it('/amount/choosed', function (done) {
        var path = '/api/insurance-slips/amount/choosed';
        var requestBody = [{
            insuranceNum: 20160408003859,
            premium: 5591
        }, {
            insuranceNum: 20160408005165,
            premium: 5591
        }];

        request(host)
            .post(path)
            .send(requestBody)
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
    
    it('GET /:id/page-info', function (done) {
        var insuranceSlipsId = 20160420001040;
        var path = '/api/insurance-slips/' + 20160420001040 + '/page-info';

        request(host)
            .get(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body.result.insurance);
                    done();
                }
            });
    });
    
    it('GET /renewal/insured', function (done) {
        var renewalNum = 20160516000791;
        var path = '/api/insurance-slips/renewal/insured?renewalNum=' + renewalNum;

        request(host)
            .get(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body.result);
                    done();
                }
            });
    });
    
    it('GET /:id/is-ready', function (done) {
        var insuranceSlipsId = 20160420001040;
        var path = '/api/insurance-slips/' + insuranceSlipsId + '/is-ready';
        
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

    it('POST /restrict-rule', function (done) {
        var path = '/api/insurance-slips/restrict-rule';
        var cookies = 'pgv_pvi=6329606144; bdshare_firstime=1464944190688; hz_guest_key=4mb4A64MjHZ2ECQNkRE9_1464944195344_1_4mb4A64MjHZ2ECQNkRE91yXGgXkEsHZ2XrbgE0ZM_1464944236479_http%25253A%25252F%25252Fwww.huize.com%25252Fproduct%25252Fdetail-10096.html; _ga=GA1.2.1179353406.1464944194; Hm_lvt_8a32affef2f860a73caf9d05780da361=1465178243,1465215028,1465274059,1465359861; ASP.NET_SessionId=lpu1nsaetxaipvz33am3yxk0; Product_History=10096%3A20154%2C10095%3A20153%2C10152%3A20290%2C10110%3A20187%2C10021%3A20024%2C10065%3A20192%2C10162%3A20307%2C10097%3A20155%2C10098%3A20156%2C10141%3A20274%2C10140%3A20273%2C10139%3A20270%2C10099%3A20157%2C10102%3A20162; RememberMeName=; .huize.com=7D0B2FFEFFDE89B572EB1B2D343E29CDBEA135F0002D652690B01225C9F0DA6D925016097CF07A9D6D8B8CC5D968C0BB542710AB67CC87730A6C3FDC86240F39FE29680235FCC55E4BA625F5180226B7C4C0C0F3145389643B916139A25A4FF7A00C98CD6141A695D49E88CA668A1657469E5D68B91C81D4209DA588A1894F882B41035FD38A2C505CF653426BF0FAE8CE53BE04EE95188E35072735A7D0DE974BE7A341; userId=lKVrGsbz1ek%3d; LoginErrCount=0';
        var requestBody = {
            data: '{"planId":"20154","productId":"10096","baseProductId":"10056","basePlanId":"10103","platform":1,"channel":1,"genes":[{"protectItemId":"209","key":"","value":"5万元"},{"protectItemId":"","key":"insurantDateLimit","value":"1天"},{"protectItemId":"","key":"insurantDate","value":"2015-05-12"},{"protectItemId":"","key":"buyCount","value":"1份"}],"optGeneOldValue":{"key":"buyCount","value":"2份"}}'
        };

        request(host)
            .post(path)
            .set('Cookie', cookies)
            .send(requestBody)
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
