var should = require('should');
var request = require('supertest');

describe('/programs', function () {
	it.skip('POST /restrict-rule', function (done) {
		var path = '/api/programs/restrict-rule';
        var requestBody = {
			data: JSON.stringify([{
				productId: 1
			}, {
				productId: 2
			}])
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

	it('POST /:id/collections', function (done) {
		var programId = 1;
		var path = '/api/programs/' + programId + '/collections';
		var cookies = 'UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html%3fDProtectPlanId%3d20025"}; bdshare_firstime=1466068040054; pgv_pvi=2278164480; pgv_si=s4716438528; ASP.NET_SessionId=etledinoa5qokwjzjefi2v2e; InsureNums=; compareProducts=; checkCompareIds=; __cfduid=dcc0571e9436235e753d280808edbe2f71466569259; _ga=GA1.2.810999470.1466040028; _gat=1; hz_visit_key=3lHSYAUywHZOt5jzuV7_1467000165465_2; hz_guest_key=3oxW3PJWQHZ4pLec2Aye_1467000165465_6_3oxW3PJWQHZ4pLec2AyesOnLWc5UHZ2MD8eMpeq_1467000165465_http%25253A%25252F%25252Fwww.huize.com%25252F; Hm_lvt_8a32affef2f860a73caf9d05780da361=1466645766,1466668894,1466669194,1466669202; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1467000166; Product_History=10021%3A10030%2C399%3A399%2C10000%3A10000%2C1453%3A1673%2C10096%3A10103%2C10097%3A10104%2C10283%3A10445%2C10148%3A20229%2C50001%3A50001%2C10098%3A10105; RememberMeName=; .huize.com=E883BAE0AE947638DDCA0452B78E74C3A8DCB806299BF7E829E45783C8E3A87D1656310C06D62BD93FBABE0A934742D5949E79DB609F3DBBEEC7556806DCDE4C6BC838C0FB322E307815BCFCE0175DB7861024E90676B0D1858CB47ACACD5629F3E8DA7A0F5762E96040D60049119477B7F3B6478E22D33D8EFEE4D7B6D31A36DF4254349DCCE9ADB54B08C92828FDCED946D2E075C3EE9C9C9D1DF526E47C58C9328CBA; userId=lKVrGsbz1ek%3d; LoginErrCount=0';
        
		request(host)
            .post(path)
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

	it('DELETE /:id/collections', function (done) {
		var programId = 1;
		var path = '/api/programs/' + programId + '/collections';
		var cookies = 'UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html%3fDProtectPlanId%3d20025"}; bdshare_firstime=1466068040054; pgv_pvi=2278164480; pgv_si=s4716438528; ASP.NET_SessionId=etledinoa5qokwjzjefi2v2e; InsureNums=; compareProducts=; checkCompareIds=; __cfduid=dcc0571e9436235e753d280808edbe2f71466569259; _ga=GA1.2.810999470.1466040028; _gat=1; hz_visit_key=3lHSYAUywHZOt5jzuV7_1467000165465_2; hz_guest_key=3oxW3PJWQHZ4pLec2Aye_1467000165465_6_3oxW3PJWQHZ4pLec2AyesOnLWc5UHZ2MD8eMpeq_1467000165465_http%25253A%25252F%25252Fwww.huize.com%25252F; Hm_lvt_8a32affef2f860a73caf9d05780da361=1466645766,1466668894,1466669194,1466669202; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1467000166; Product_History=10021%3A10030%2C399%3A399%2C10000%3A10000%2C1453%3A1673%2C10096%3A10103%2C10097%3A10104%2C10283%3A10445%2C10148%3A20229%2C50001%3A50001%2C10098%3A10105; RememberMeName=; .huize.com=E883BAE0AE947638DDCA0452B78E74C3A8DCB806299BF7E829E45783C8E3A87D1656310C06D62BD93FBABE0A934742D5949E79DB609F3DBBEEC7556806DCDE4C6BC838C0FB322E307815BCFCE0175DB7861024E90676B0D1858CB47ACACD5629F3E8DA7A0F5762E96040D60049119477B7F3B6478E22D33D8EFEE4D7B6D31A36DF4254349DCCE9ADB54B08C92828FDCED946D2E075C3EE9C9C9D1DF526E47C58C9328CBA; userId=lKVrGsbz1ek%3d; LoginErrCount=0';
        
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

	it('GET /:id/is-collected', function (done) {
		var programId = 1;
		var path = '/api/programs/' + programId + '/is-collected';
		var cookies = 'UtmCookieKey={"UtmSource":"","UtmMedium":"","UtmTerm":"","UtmContent":"","UtmCampaign":"","UtmUrl":"http%3a%2f%2fwww.huize.com%2fproduct%2fdetail-10021.html%3fDProtectPlanId%3d20025"}; bdshare_firstime=1466068040054; pgv_pvi=2278164480; pgv_si=s4716438528; ASP.NET_SessionId=etledinoa5qokwjzjefi2v2e; InsureNums=; compareProducts=; checkCompareIds=; __cfduid=dcc0571e9436235e753d280808edbe2f71466569259; _ga=GA1.2.810999470.1466040028; _gat=1; hz_visit_key=3lHSYAUywHZOt5jzuV7_1467000165465_2; hz_guest_key=3oxW3PJWQHZ4pLec2Aye_1467000165465_6_3oxW3PJWQHZ4pLec2AyesOnLWc5UHZ2MD8eMpeq_1467000165465_http%25253A%25252F%25252Fwww.huize.com%25252F; Hm_lvt_8a32affef2f860a73caf9d05780da361=1466645766,1466668894,1466669194,1466669202; Hm_lpvt_8a32affef2f860a73caf9d05780da361=1467000166; Product_History=10021%3A10030%2C399%3A399%2C10000%3A10000%2C1453%3A1673%2C10096%3A10103%2C10097%3A10104%2C10283%3A10445%2C10148%3A20229%2C50001%3A50001%2C10098%3A10105; RememberMeName=; .huize.com=E883BAE0AE947638DDCA0452B78E74C3A8DCB806299BF7E829E45783C8E3A87D1656310C06D62BD93FBABE0A934742D5949E79DB609F3DBBEEC7556806DCDE4C6BC838C0FB322E307815BCFCE0175DB7861024E90676B0D1858CB47ACACD5629F3E8DA7A0F5762E96040D60049119477B7F3B6478E22D33D8EFEE4D7B6D31A36DF4254349DCCE9ADB54B08C92828FDCED946D2E075C3EE9C9C9D1DF526E47C58C9328CBA; userId=lKVrGsbz1ek%3d; LoginErrCount=0';
        
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
});