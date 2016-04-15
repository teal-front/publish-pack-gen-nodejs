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

    it('POST /:id/comments', function (done) {
        var productId = 239;
        var path = '/products/' + productId + '/comments';

        var comment = {
            productId: productId,
            userId: 247744,
            level: "3",
            content: "这是一条新评论",
            type: 0,
            productName: "新华人寿SOS境外救援医疗保险"
        };

        request(host)
            .post(path)
            .send(comment)
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
        var path = '/products/' + productId + '/comments/' + commentId;

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
        var path = '/products/' + productId + '/comments/' + commentId;

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
        var path = '/products/comparison';
        var requestBody = [20008, 20013];

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
        var path = '/products/plans-comparison';
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
        var path = '/products/collection';
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

    it('POST /insure-page', function (done) {
        var path = '/products/insure-page';
        var requestBody = {
            baseProductId: 1,
            baseProductPlanId: 1,
            productPlanId: 1,
            trialGenesId: 1
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
        var path = '/products/' + productId + '/restrict-rule';

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
        var path = '/products/plans/list';
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
});
