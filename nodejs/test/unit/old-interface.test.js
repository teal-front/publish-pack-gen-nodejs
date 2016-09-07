var request = require('supertest');
var should = require('should');

describe('old interface', function () {
    it('GET passport.hzins.com/SignIn/GetCurrentUser', function (done) {
        var cookies = "pgv_pvi=152879104; bdshare_firstime=1457054174045; __utma=1.1922192295.1455778686.1457940653.1457940653.1; __utmz=1.1457940653.1.1.utmcsr=passport.hzins.com|utmccn=(referral)|utmcmd=referral|utmcct=/signin/; UtmCookieKey={\"UtmSource\":\"\",\"UtmMedium\":\"\",\"UtmTerm\":\"\",\"UtmContent\":\"\",\"UtmCampaign\":\"\",\"UtmUrl\":\"http%3a%2f%2fwww.hzins.com%2f\"}; pgv_si=s1431734272; ASP.NET_SessionId=1cowohkrre1mrfb5lrb0iaks; LoginErrCount=3; _gat=1; .hzins.com=53DFEBA85E1EDBA5F076CD84B8565AFF664CF108DED2B5A2E87C4C2075B0E801CE420C54AE10E5E0E827057274C16ED2B0DE3A758057193BBE3E35C0CCC3AB76BDCCF288C3C098E869BA3453C0494C9C4CF76990646FD90730F87C851BD39A724C7D0B39F3DD75908F5CF19C760100CE183983271D9D7C4F85F65182FF7340E37996BA7196CE925FA3A570357A37776A87815802ED8CAD031DDF9D53AB695BC6CCAA325C; userId=lKVrGsbz1ek%3d; _ga=GA1.2.1922192295.1455778686; hz_visit_key=1yXAiW030HZ118hNtAPG_1459476674631_13; hz_guest_key=4guQSPkHLHZ2XaQKPTIh_1459476674631_10_4guQSPkHLHZ2XaQKPTIh1hVfCyfkZHZ1PpLq9HUp_1459478974074_http%25253A%25252F%25252Fwww.hzins.com%25252F; Hm_lvt_b2813824050899db8f7ba87c6697f19f=1458279934,1458555201,1458805562,1459136354; Hm_lpvt_b2813824050899db8f7ba87c6697f19f=1459478974";

        request('http://passport.hzins.com/')
            .get('/SignIn/GetCurrentUser')
            .set('Cookie', cookies)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body);
                    should(body.Status).eql(1);
                    should(body.Data).have.properties('UserId', 'LoginName', 'Moblie');
                    done();
                }
            });
    });
});
