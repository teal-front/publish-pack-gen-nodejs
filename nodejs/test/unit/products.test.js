var request = require('supertest');
var should = require('should');

describe('/products', function () {
    var commentId;

    it('GET /', function (done) {
        var path = '/product/detail-10021.html?DProtectPlanId=20024&debug=true';

        request(host)
            .get(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    console.log(body.security);
                    console.log(body.security.planList);
                    console.log(body.restrictRules[0]);
                    done();
                }
            });
    });

    it('GET /:id/comments', function (done) {
        var productId = 239;
        var path = '/products/' + productId + '/comments?page=1&limit=10&type=0';

        request(host)
            .get(path)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var body = res.body;
                    body.should.be.a.Object;
                    body.result.should.have.properties(['total', 'pageSize', 'pageIndex', 'skip', 'data']);
                    body.result.data.should.be.a.Array;
                    done();
                }
            });
    });

    it('POST /comments', function (done) {
        var path = '/api/products/comments';
        var cookies = "sid=s%3AL6fh4bbudUoYlJ-onsxbuzfhWzuXs3xx.ACOpLt47%2FW3GWyrLsiezNXx%2F9sArkWtdSnGtn80kd68; Product_History=20024; .huize.com=CBC1F27CCEBC654F711EE370ABAB7948F7BBA5065A7ACE9B5CE7477B68B118F5407C0AB6F7638AE964ABF3011CA60C5603D7E8F31C2ED6BCCCCE557A12E75200182EB0B188DF3C1D57C5FA5C5571898BF3577264DFD2F5BDA056B4685A720A7609D2414D8C772DE2C359A94790BD13EF23E85B608742A8CA8478533A3F9C8B26B07C778534B1D39F55D55D9C05C96977CB8338631FE92250337E12DB80541DECEA984E84; userId=lKVrGsbz1ek%3d; LoginErrCount=0";
        var requestBody = {
            data: JSON.stringify({
                ProductId: 10049,
                PlanId: 337,
                AttitudeLevel: 5,
                SpeedLevel: 5,
                DescLevel: 5,
                Content: '这是一条测试评论',
                InsureNum: 20160414030936,
                CommentType: 1
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
                    commentId = body.result.id;
                    console.log(body);
                    done();
                }
            });
    });

    it('PUT /:id/comments/commentId', function (done) {
        var productId = 239;
        var path = '/api/products/' + productId + '/comments/' + commentId;

        var comment = {
            id: commentId,
            productId: productId,
            userId: 247744,
            level: "3",
            content: "这是一条修改过评论",
            type: 0,
            productName: "新华人寿SOS境外救援医疗保险"
        };

        request(host)
            .put(path)
            .send(comment)
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

    it('DELETE /:id/comments/commentId', function (done) {
        var productId = 239;
        var path = '/api/products/' + productId + '/comments/' + commentId;

        request(host)
            .delete(path)
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

    it('POST /comparison', function (done) {
        var path = '/api/products/comparison';
        var requestBody = {data: "[20008, 20013]"};

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

    it('POST /plans-comparison', function (done) {
        var path = '/api/products/plans-comparison';
        var requestBody = {
            data: "[20008, 20013]"
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

    it('POST /collection', function (done) {
        var path = '/api/products/collection';
        var requestBody = {
            planId: 1
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

    it.skip('POST /:id/restrict-rule', function (done) {
        var productId = 3890;
        var path = '/api/products/' + productId + '/restrict-rule';

        var requestBody = {};

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

    it('GET review-1010-1046-15111224631288.html', function (done) {
        var path = '/product/review-3890-4776-15111224631288.html?type=pl&debug=true';

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

    it('GET /prodreview/showlist239-1.html', function (done) {
        var path = '/product/prodreview/showlist239-1.html?type=0&debug=true';

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

    it('POST /plans/list', function (done) {
        var path = '/api/products/plans/list';
        var requestBody = {
            data: "[20008, 20013]"
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
    
    it('GET /categories', function (done) {
        var path = '/api/products/categories';
        
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
    
    it('GET /:id/issuing-state', function (done) {
        var productId = 10009;
        var path = '/api/products/' + productId + '/issuing-state';
        
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

    it('GET /plans/:id/similar', function (done) {
        var planId = 20206;
        var path = '/api/products/plans/' + planId + '/similar';
        
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
