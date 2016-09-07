var should = require('should');
var request = require('supertest');

describe("/users", function() {
    it("GET /islogin", function(done) {
        var path = "/api/users/islogin";

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
        var path = "/api/users/customer-service";
        var cookies = "RememberMeName=; .huize.com=83917D15D4927B77BCEADD22D000D99C1DBC6544254162AADF503F640F3872AA06D3B631517B65F727981D99A02233AED7BC908F3134540228252BB9B9EDA10570CDF46F3C4BDB875436742060765D79C2DB75CE87CFF6A7527A0DD6BB84E56AE3AE50B47413AFD3B9594F39D9E3FC769F7C79FB7F390D4541C6336A8F241B77828C1EFF5C2197D16793B0EB160EC6B89288ECD88FFAB7F5A1A9F3C2B4DE76D7680459F0; userId=lKVrGsbz1ek%3d; LoginErrCount=0; Product_History=20024%2C20154; sid=s%3A4fVqPq9HQn7Jdq3F1_jaP-XbhTLJZEPj.cm%2FavypCSCPIF5M0Q1RK5thrZIllm3OBQQ%2BF343Sj2g";

        request(host)
            .get(path)
            .set('Cookie', cookies)
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

    it('GET /contacts', function (done) {
        var userId = 247744;
        var path = '/api/users/contacts';
        var cookies = "__jsluid=9d75951c2abe0d4c0b385ef60b02b3a8; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.huize.com%2f\"}; pgv_pvi=1237854208; pgv_si=s5467755520; bdshare_firstime=1461136125964; HzIns_Today_Brower_Product=%5B840%5D; HzIns_Browse_Product_History_NewNew=%5B%7B%22i%22%3A816%2C%22n%22%3A%22%u5B89%u5FC3%u5B9D%u8D1D%u5C11%u513F%u91CD%u5927%u75BE%u75C5%u4FDD%u969C%u8BA1%u5212%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2C%22u%22%3A%22http%3A//www.huize.com/product/detail-840.html%22%7D%5D; hz_guest_key=1cfaxc6vQHZ1ksyTagoA_1461145059828_2_1cfaxc6vQHZ1ksyTagoA3zU3P87G3HZ2k9rfps5f_1461145092425_http%25253A%25252F%25252Fwww.huize.com%25252Forders%25252Fsettlement%25252F28d38c1c43d64c08b9794184b02fdaba; _ga=GA1.2.1689026014.1461136125; Hm_lvt_8a32affef2f860a73caf9d05780da361=1460447166,1461136123; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1461149066; .huize.com=6C0AB738CC71D59DFEE3BB2B4A1F47A57F645DD4B4DB16A92F00A2D98565EF29D358152F005BADDC396950A91B83AA217919601E24A6C1F8FAE21440876190EE8898CA4D5FAD78C9D0DA5EC385F95EDCBC304A63F4A9F1C7F9EDD24D8F53BD32DD42A953EB79915823A5E15F7C2B9642BEDEE0476CB4C68DDBFEACAEAA3A851F41B2B1698126624AE7157B297BEB9961D047D21C916D434B7913247428F8A40ECB2D7CBC";

        request(host)
            .get(path)
            .set('Cookie', cookies)
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
        var path = '/api/users/contacts/' + contactId;

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
        var path = '/api/users/balance?currencyId=' + currencyId;
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
        var path = '/api/users/freezed-balance?currencyId=' + currencyId;

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
        var path = '/api/users/red-envelopes';
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

    it('POST /actived/red-envelope', function (done) {
        var userId = 247499;
        var redEnvelopeNum = 1;
        var path = '/api/users/actived/red-envelope';
        var requestBody = {
           data: JSON.stringify({
               redEnvelopeNum: redEnvelopeNum
           })
        };
        var cookies = "Product_History=20024; .huize.com=6A032CD8CA3F0116FA275516D87C79AC2E629C83022BC4F6ABCDDD60D395119B9E0459D4CE0FB19738142B299F16C98940175248267408DCBE7D39BEE9046081918CE63DD2F376CFA569FCF2874C1C66453393DE40FC9D31D978296E52BDB2AE0D146D38B2FF45184DE40EAC4CE807BEB20C3F9A4E0EFA296D90FF5FF08D24E204069C82FDC8B91AABBF63C3CCCFED24CB59037C4B9D785B2611028F2528562F8FA39C23; userId=lKVrGsbz1ek%3d; LoginErrCount=0";

        request(host)
            .post(path)
            .send(requestBody)
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

    it('GET /addresses', function (done) {
        var path = '/api/users/addresses';
        var cookies = 'pgv_pvi=6329606144; bdshare_firstime=1464944190688; hz_guest_key=4mb4A64MjHZ2ECQNkRE9_1464944195344_1_4mb4A64MjHZ2ECQNkRE91yXGgXkEsHZ2XrbgE0ZM_1464944236479_http%25253A%25252F%25252Fwww.huize.com%25252Fproduct%25252Fdetail-10096.html; _ga=GA1.2.1179353406.1464944194; pgv_si=s8940861440; UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10096.html"}; ASP.NET_SessionId=scntb3k01gh0ukhkxvr4au3n; Hm_lvt_8a32affef2f860a73caf9d05780da361=1465027049,1465027049,1465027050,1465178243; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1465184073; Product_History=10095%3A20153%2C10096%3A20154%2C10152%3A20290%2C10021%3A20024%2C10102%3A20162; RememberMeName=; .huize.com=D75B1534DF5F77E42DA59061613B2FDF44EE6427D7F71237F2CD6151152176EE561E1F213B409096CD1ADB49B00C54C8FD1FA60805968908DD4493BED360A370FD15412E69F8F9062B24839C8B9BB340C52CB7812F7A22419EF7027038EE38BCE52467D144262CA8975C68589104680511C48A9322B81B05D9B1D989031E1A31E9CF1F9923D934DFDB7384F66B5E46E6AF75DA730DED9129A185B60A2CA6501FD2CD7F88; userId=qACv%2bjSPVq8%3d; LoginErrCount=0';
        
        request(host)
            .get(path)
            .set('Cookie', cookies)
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
    
    it('PUT /addresses/:id', function (done) {
        var shipAddressId = 20360;
        var path = '/api/users/addresses/' + shipAddressId;
        var cookies = 'pgv_pvi=6329606144; bdshare_firstime=1464944190688; hz_guest_key=4mb4A64MjHZ2ECQNkRE9_1464944195344_1_4mb4A64MjHZ2ECQNkRE91yXGgXkEsHZ2XrbgE0ZM_1464944236479_http%25253A%25252F%25252Fwww.huize.com%25252Fproduct%25252Fdetail-10096.html; _ga=GA1.2.1179353406.1464944194; pgv_si=s8940861440; UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10096.html"}; ASP.NET_SessionId=scntb3k01gh0ukhkxvr4au3n; Hm_lvt_8a32affef2f860a73caf9d05780da361=1465027049,1465027049,1465027050,1465178243; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1465184073; Product_History=10095%3A20153%2C10096%3A20154%2C10152%3A20290%2C10021%3A20024%2C10102%3A20162; RememberMeName=; .huize.com=D75B1534DF5F77E42DA59061613B2FDF44EE6427D7F71237F2CD6151152176EE561E1F213B409096CD1ADB49B00C54C8FD1FA60805968908DD4493BED360A370FD15412E69F8F9062B24839C8B9BB340C52CB7812F7A22419EF7027038EE38BCE52467D144262CA8975C68589104680511C48A9322B81B05D9B1D989031E1A31E9CF1F9923D934DFDB7384F66B5E46E6AF75DA730DED9129A185B60A2CA6501FD2CD7F88; userId=qACv%2bjSPVq8%3d; LoginErrCount=0';
        var requestBody = {
            data: JSON.stringify({
                name: '小雪'
            })
        };
        
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
                };
            });
    });
});
