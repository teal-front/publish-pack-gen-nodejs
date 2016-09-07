var request = require('supertest');
var should = require('should');

describe('/shopping-cart', function () {

    it('DELETE /api/shopping-cart/items', function (done) {
        var insuranceSlipsId = 20160408003859;
        var path = '/api/shopping-cart/items?insuranceNum=' + insuranceSlipsId;

        request(host)
            .delete(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body);
                    done();
                }
            });
    });

    it('GET /list without login', function (done) {
        var path = '/api/shopping-cart/list';
        var cookies = "InsureNums=20160401001539;";

        request(host)
            .get(path)
            .set('Cookie', cookies)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body.result[0].cartItems);
                    done();
                }
            });
    });

    it('GET /list with login', function (done) {
        var path = '/api/shopping-cart/list';
        var cookies = "pgv_pvi=1917646848; pgv_si=s8309663744; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fins-23-0-1_140\"}; ASP.NET_SessionId=230rhn3pzesstyoe1q3qdnyr; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; Hm_lpvt_b2813824050899db8f7ba87c6697f19f=1459999339; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460107404256_4_sOg7DUdLHZ2ETvmE0r634FqLAbAVHZ3bnoWmLjr_1460107404266_http%25253A%25252F%25252Fwww.huize.com%25252F; _gat=1; .huize.com=E759E886657E3F04220853BE623B6AECB2BA419E7B6F57A583E5228A1274E9DE484B7FF0F1CCB1A998616F969AFCE6D01811913C3CBD7E224256F9D3A495299F450D2FFCB9DB54873A3F7FD2EC2A7E66E62CAC6C045137DC6DF3C879138AFBE3F99623533CB51103D506FCA87F1CFDBAADA9FEFEA59A033A4A2D9CAF05229A315FC67A0F00E8BAB08F7477A19F7011273DA33F065706202BAACD3649F476852BF21D1B84; userId=lKVrGsbz1ek%3d; LoginErrCount=0; Hm_lvt_8a32affef2f860a73caf9d05780da361=1459999348; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1460113962; _ga=GA1.2.1868197744.1459991824";

        request(host)
            .get(path)
            .set('Cookie', cookies)
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

    it('DELETE /items/all without login', function (done) {
        var path = '/api/shopping-cart/items/all';
        var requestBody = [20160408003859];

        request(host)
            .delete(path)
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

    it('DELETE /items/all with login', function (done) {
        var path = '/api/shopping-cart/items/all';
        var cookies = "pgv_pvi=1917646848; pgv_si=s8309663744; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fins-23-0-1_140\"}; ASP.NET_SessionId=230rhn3pzesstyoe1q3qdnyr; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; Hm_lpvt_b2813824050899db8f7ba87c6697f19f=1459999339; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460107404256_4_sOg7DUdLHZ2ETvmE0r634FqLAbAVHZ3bnoWmLjr_1460107404266_http%25253A%25252F%25252Fwww.huize.com%25252F; _gat=1; .huize.com=E759E886657E3F04220853BE623B6AECB2BA419E7B6F57A583E5228A1274E9DE484B7FF0F1CCB1A998616F969AFCE6D01811913C3CBD7E224256F9D3A495299F450D2FFCB9DB54873A3F7FD2EC2A7E66E62CAC6C045137DC6DF3C879138AFBE3F99623533CB51103D506FCA87F1CFDBAADA9FEFEA59A033A4A2D9CAF05229A315FC67A0F00E8BAB08F7477A19F7011273DA33F065706202BAACD3649F476852BF21D1B84; userId=lKVrGsbz1ek%3d; LoginErrCount=0; Hm_lvt_8a32affef2f860a73caf9d05780da361=1459999348; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1460113962; _ga=GA1.2.1868197744.1459991824";

        request(host)
            .delete(path)
            .set('Cookie', cookies)
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
    
    it('GET /items/count', function (done) {
        var path = '/api/shopping-cart/items/count';
        var cookies = "pgv_pvi=1917646848; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460107404256_4_sOg7DUdLHZ2ETvmE0r634FqLAbAVHZ3bnoWmLjr_1460107404266_http%25253A%25252F%25252Fwww.huize.com%25252F; .huize.com=79D012DD10973AB3FCF995EF8A41FB712A3025D179A3B2D6864E23677E8EB1E74075B12F920DD5812855B9B13A4D9D52DD5DE1EB935F8E47A6D87D3A8FCBB055E7DCC9091AFC5A1D770EEEE169884E041DA8610817BCFE9A0F372D53ED4B7844B7FE67FCF0D43FA669123A3BB52940A67F79FA43F948EAA698D474AF57987CA6A6DC279350E574FBAD05A00BC89AF641367EBCB4B218C8730E6160B7D0826E01197939E8; userId=lKVrGsbz1ek%3d; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html\"}; pgv_si=s9526481920; bdshare_firstime=1460346331980; Product_History=20024";
        
        request(host)
            .get(path)
            .set('Cookie', cookies)
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
    
    it('POST /items/combine', function (done) {
        var path = '/api/shopping-cart/items/combine';
        var requestBody = {
            data: JSON.stringify({
                userId: 249445,
                insuranceNums: [20160601000166, 20160601001579]
            })
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
});
