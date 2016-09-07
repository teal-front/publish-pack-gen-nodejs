var should = require('should');
var request = require('supertest');

describe('/orders', function () {
    it('POST /settlement', function (done) {
        var cookies = "__jsluid=9d75951c2abe0d4c0b385ef60b02b3a8; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2f\"}; pgv_pvi=1237854208; pgv_si=s5467755520; bdshare_firstime=1461136125964; HzIns_Today_Brower_Product=%5B840%5D; HzIns_Browse_Product_History_NewNew=%5B%7B%22i%22%3A816%2C%22n%22%3A%22%u5B89%u5FC3%u5B9D%u8D1D%u5C11%u513F%u91CD%u5927%u75BE%u75C5%u4FDD%u969C%u8BA1%u5212%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2C%22u%22%3A%22http%3A//www.huize.com/product/detail-840.html%22%7D%5D; hz_guest_key=1cfaxc6vQHZ1ksyTagoA_1461145059828_2_1cfaxc6vQHZ1ksyTagoA3zU3P87G3HZ2k9rfps5f_1461145092425_http%25253A%25252F%25252Fwww.huize.com%25252Forders%25252Fsettlement%25252F28d38c1c43d64c08b9794184b02fdaba; _ga=GA1.2.1689026014.1461136125; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166,1461136123; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1461149066; .huize.com=6C0AB738CC71D59DFEE3BB2B4A1F47A57F645DD4B4DB16A92F00A2D98565EF29D358152F005BADDC396950A91B83AA217919601E24A6C1F8FAE21440876190EE8898CA4D5FAD78C9D0DA5EC385F95EDCBC304A63F4A9F1C7F9EDD24D8F53BD32DD42A953EB79915823A5E15F7C2B9642BEDEE0476CB4C68DDBFEACAEAA3A851F41B2B1698126624AE7157B297BEB9961D047D21C916D434B7913247428F8A40ECB2D7CBC";
        var path = '/api/orders/settlement';
        var requestBody = {
            data: JSON.stringify([{
                insuranceNum: 20160428001303,
                premium: 5591  
            }])
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
        var path = '/api/orders/available/red-envelopes';
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
    
    it('POST /', function (done) {
        var path = '/api/orders';
        var requestBody = {
            data: JSON.stringify({
                gatewayPaymentItemInfo: {
                    amount: 5591,
                    paymentGatewayId: 99
                },
                insurancePaymentInfos: [{
                    insuranceNum: 20160429001114
                }],
                totalBuyPrice: 5591,
                totalDiscount: 0,
                totalPayable: 5591
            })
        };
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        
        request(host)
            .post(path)
            .send(requestBody)
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
    
    it('PUT /:id', function (done) {
        var orderId = 201604250000001060;
        var path = '/api/orders/' + orderId;
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        
        request(host)
            .put(path)
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
    
    it('DELETE /:id', function (done) {
        var orderId = 201604250000001060;
        var path = '/api/orders/' + orderId;
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        
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
    
    it('GET /:id/detail', function (done) {
        var orderId = 201604250000001060;
        var path = '/api/orders/' + orderId + '/detail';
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        
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
    
    it('POST /payment-combination', function (done) {
        var path = '/api/orders/payment-combination';
        var cookies = "Product_History=20024,20059,237,20007; __jsluid=9d75951c2abe0d4c0b385ef60b02b3a8; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2f\"}; pgv_pvi=1237854208; pgv_si=s5467755520; bdshare_firstime=1461136125964; HzIns_Today_Brower_Product=%5B840%5D; HzIns_Browse_Product_History_NewNew=%5B%7B%22i%22%3A816%2C%22n%22%3A%22%u5B89%u5FC3%u5B9D%u8D1D%u5C11%u513F%u91CD%u5927%u75BE%u75C5%u4FDD%u969C%u8BA1%u5212%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2C%22u%22%3A%22http%3A//www.huize.com/product/detail-840.html%22%7D%5D; hz_guest_key=1cfaxc6vQHZ1ksyTagoA_1461145059828_2_1cfaxc6vQHZ1ksyTagoA3zU3P87G3HZ2k9rfps5f_1461145092425_http%25253A%25252F%25252Fwww.huize.com%25252Forders%25252Fsettlement%25252F28d38c1c43d64c08b9794184b02fdaba; _ga=GA1.2.1689026014.1461136125; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166,1461136123; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1461149066; .huize.com=6C0AB738CC71D59DFEE3BB2B4A1F47A57F645DD4B4DB16A92F00A2D98565EF29D358152F005BADDC396950A91B83AA217919601E24A6C1F8FAE21440876190EE8898CA4D5FAD78C9D0DA5EC385F95EDCBC304A63F4A9F1C7F9EDD24D8F53BD32DD42A953EB79915823A5E15F7C2B9642BEDEE0476CB4C68DDBFEACAEAA3A851F41B2B1698126624AE7157B297BEB9961D047D21C916D434B7913247428F8A40ECB2D7CBC; userId=lKVrGsbz1ek%3d";
        var requestBody = {
            data: JSON.stringify({
                insurancePaymentInfos: [{
                    insuranceNum: 20160421002587
                }],
                paymentItemInfos:[{
                    currencyId: 1003,
                    amount: 1
                }]
            })
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
    
    it('POST /available/balance', function (done) {
        var path = '/api/orders/available/balance';
        var cookies = 'UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html%3fDProtectPlanId%3d20025"}; Product_History=10021%3A10030%2C10096%3A10103; HzIns_Today_Brower_Product=%5B152%5D; bdshare_firstime=1466068040054; _ga=GA1.2.810999470.1466040028; _gat=1; Hm_lvt_8a32affef2f860a73caf9d05780da361=1465274059,1465359861,1465460546,1466040028; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1466068040; hz_visit_key=3dbHCf6KoHZ301dtG0aR_1466068040218_2; hz_guest_key=MGKRfR5LHZ4aWta75Mo_1466068040218_5_MGKRfR5LHZ4aWta75Mo3CKcE3d6fHZ3Kj0sT1fI_1466068040218_http%25253A%25252F%25252Fwww.huize.com%25252Fproduct%25252Fdetail-152.html; RememberMeName=; .huize.com=A93B04BB65A949DA32E36E33E061E5583F6E1DF422707B7735977C7E1C5C32B6728E7596C1246E7214A5363CB90E9CF6B976C194F79F905600112F054901EA1AFE64022A0D0C6BD79C3EB881C515DCF977E4E2F205414FF0D2F3F6EC1C20E729E83ED28FBDAD7B9034B64AA17414589509BCA33C2843A70FA366712478098411B36339B3091E04189698BBBD4A85BAE80417FD69801AE7B64CE25FCC8FFAB63B208BB082; userId=lKVrGsbz1ek%3d; LoginErrCount=0';
        var requestBody = {
            data: JSON.stringify([10445])
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
    
    it('GET /payment/gateway', function (done) {
        var orderId = 201604250000001060;
        var path = '/api/orders/payment/gateway?orderNum=' + orderId;
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        
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
    
    it('POST /payment/gateway', function (done) {
        var path = '/api/orders/payment/gateway';
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        var requestBody = {
            data: JSON.stringify({
                orderNum: '201604290000000076',
                totalBuyPrice: 5591,
                totalDiscount: 0,
                totalPayable: 5591,
                gatewayId: 1
            })
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
    
    it('POST /:id/freezed/currency', function (done) {
        var orderId = 201604220000000004;
        var path = '/api/orders/' + 201604220000000004 + '/freezed/currency';
        var cookies = "__jsluid=9d75951c2abe0d4c0b385ef60b02b3a8; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2f\"}; pgv_pvi=1237854208; pgv_si=s5467755520; bdshare_firstime=1461136125964; HzIns_Today_Brower_Product=%5B840%5D; HzIns_Browse_Product_History_NewNew=%5B%7B%22i%22%3A816%2C%22n%22%3A%22%u5B89%u5FC3%u5B9D%u8D1D%u5C11%u513F%u91CD%u5927%u75BE%u75C5%u4FDD%u969C%u8BA1%u5212%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2C%22u%22%3A%22http%3A//www.huize.com/product/detail-840.html%22%7D%5D; hz_guest_key=1cfaxc6vQHZ1ksyTagoA_1461145059828_2_1cfaxc6vQHZ1ksyTagoA3zU3P87G3HZ2k9rfps5f_1461145092425_http%25253A%25252F%25252Fwww.huize.com%25252Forders%25252Fsettlement%25252F28d38c1c43d64c08b9794184b02fdaba; _ga=GA1.2.1689026014.1461136125; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166,1461136123; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1461149066; .huize.com=6C0AB738CC71D59DFEE3BB2B4A1F47A57F645DD4B4DB16A92F00A2D98565EF29D358152F005BADDC396950A91B83AA217919601E24A6C1F8FAE21440876190EE8898CA4D5FAD78C9D0DA5EC385F95EDCBC304A63F4A9F1C7F9EDD24D8F53BD32DD42A953EB79915823A5E15F7C2B9642BEDEE0476CB4C68DDBFEACAEAA3A851F41B2B1698126624AE7157B297BEB9961D047D21C916D434B7913247428F8A40ECB2D7CBC; userId=lKVrGsbz1ek%3d";
  
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
});