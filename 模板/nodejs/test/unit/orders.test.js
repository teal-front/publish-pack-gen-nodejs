var should = require('should');
var request = require('supertest');

describe('/orders', function () {
    it('/settle', function (done) {
        var cookies = "pgv_pvi=1917646848; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460107404256_4_sOg7DUdLHZ2ETvmE0r634FqLAbAVHZ3bnoWmLjr_1460107404266_http%25253A%25252F%25252Fwww.huize.com%25252F; .huize.com=79D012DD10973AB3FCF995EF8A41FB712A3025D179A3B2D6864E23677E8EB1E74075B12F920DD5812855B9B13A4D9D52DD5DE1EB935F8E47A6D87D3A8FCBB055E7DCC9091AFC5A1D770EEEE169884E041DA8610817BCFE9A0F372D53ED4B7844B7FE67FCF0D43FA669123A3BB52940A67F79FA43F948EAA698D474AF57987CA6A6DC279350E574FBAD05A00BC89AF641367EBCB4B218C8730E6160B7D0826E01197939E8; userId=lKVrGsbz1ek%3d; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html\"}; pgv_si=s9526481920; bdshare_firstime=1460346331980; Product_History=20024";
        var path = '/orders/settle';
        var requestBody = {
            data: [{
                insuranceNum: 20160411001585,
                premium: 300,   
            }]
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
    
    it('available/red-envelopes', function (done) {
        var path = '/orders/available/red-envelopes';
        var requestBody = {
            data: "[20008, 20013]"
        };
        var cookies = "pgv_pvi=1917646848; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1459991824,1459992780,1459993468,1459999339; userId=lKVrGsbz1ek%3d; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html\"}; pgv_si=s9526481920; bdshare_firstime=1460346331980; Product_History=20024; __jsluid=f4491978257186b5fb72ca67b5cbe9d3; hz_guest_key=sOg7DUdLHZ2ETvmE0r6_1460447165494_5_sOg7DUdLHZ2ETvmE0r6BkqXJaUaHZ2aZNq9WAh_1460447165507_http%25253A%25252F%25252Fwww.huize.com%25252F; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1460447168; _ga=GA1.2.674699184.1460447166; .huize.com=DF0C598472E8861F9A7769B2E88F0650828F33FAB4CCA605CD71D2F313237103690B780F17FCB643C225AB13EB69881E300A92D550CCBF150C8E9205CB71B39E2572D07B351CC81638C8D48271101BEAD3FBEE99B2A50C4A0F388616D68D76413FFB544C4011CCC557211DB94431EC0FB0A42AE9939626DC1E1CFC44D0C3C4022B08D4E50218C0DA5DB25D0771121589AB48A48ADA6965216B2655E32BE5BEAAB0D63902";
        
        request(host)
            .post(path)
            .set('Cookie', cookies)
            .send(requestBody)
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