var request = require('supertest');
var should = require('should');

describe('/insurance-slips', function () {
    it('POST /', function (done) {
        var path = "/insurance-slips";
        var requestBody = [{
                productId: 10015,
                planId: 20016,
                inShoppingCart: true
            }, {
                productId: 10015,
                planId: 20016,
                inShoppingCart: true
            }];
        requestBody = {
            data: JSON.stringify(requestBody)
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
        var insuranceSlipsId = 20160401001539;
        var path = '/insurance-slips/' + insuranceSlipsId + '/start-date';
        var requestBody = {
            userId: null,
            insureNum: insuranceSlipsId,
            startDate: '2016-03-30'
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
        var insuranceSlipsId = 20160407002396;
        var path = '/insurance-slips/' + insuranceSlipsId;
        var requestBody = {
            insureNum: null,
            userId: 241079,
            ruleParam: {
                productId: "10015",
                planId: "20016",
                baseProductId: "2591",
                basePlanId: "2854",
                platform: "1",
                channel: 1,
                trialPrice: {
                    isInsure: 1,
                    originalPrice: 27500,
                    singlePrice: 5591,
                    vipPrice: 5591,
                    payPrice: 5591,
                    goldenBean: 28,
                    buyCount: 1,
                    trialPriceType: 1,
                    insurantPayment: false,
                    notInsure: false
                },
                genes: [
                    {
                        protectItemId: "",
                        key: "buyCount",
                        value: "1年"
                    },
                    {
                        protectItemId: "",
                        key: "insurantDateLimit",
                        value: "1年"
                    },
                    {
                        protectItemId: "",
                        key: "insurantDate",
                        value: "1-65周岁"
                    }
                ],
                optGeneOldValue: {
                    key: "insurantDate",
                    value: "1-65周岁"
                },
                preminum: 5591
            },
            preminum: 2500,
            buySinglePrice: 2500,
            totalNum: 1,
            applicantPersonAttributeInfoList: [
                {
                    key: "provCityText",
                    value: "广东省-佛山市-南海区"
                },
                {
                    key: "cName",
                    value: "张大牛头人就是本人"
                },
                {
                    key: "eName"
                },
                {
                    key: "cardTypeId",
                    value: "2"
                },
                {
                    key: "cardTypeName",
                    value: "护照"
                },
                {
                    key: "cardNumber",
                    value: "D234388746436qss112"
                },
                {
                    key: "cardPeriod"
                },
                {
                    key: "sex",
                    value: "0"
                },
                {
                    key: "birthdate",
                    value: "1991-01-01"
                },
                {
                    key: "countryId",
                    value: "0"
                },
                {
                    key: "country"
                },
                {
                    key: "provCityId",
                    value: "440000-440600-440605"
                },
                {
                    key: "provinceCode"
                },
                {
                    key: "provinceName"
                },
                {
                    key: "cityCode"
                },
                {
                    key: "cityText"
                },
                {
                    key: "areaCode"
                },
                {
                    key: "areaText"
                },
                {
                    key: "jobText"
                },
                {
                    key: "jobNum"
                },
                {
                    key: "jobLevel"
                },
                {
                    key: "jobInfo"
                },
                {
                    key: "homeAddress"
                },
                {
                    key: "homePost"
                },
                {
                    key: "officeAddress"
                },
                {
                    key: "officePost"
                },
                {
                    key: "tel"
                },
                {
                    key: "contactAddress"
                },
                {
                    key: "contactPost"
                },
                {
                    key: "moblie",
                    value: "13200132111"
                },
                {
                    key: "moblieCipher"
                },
                {
                    key: "phone"
                },
                {
                    key: "email",
                    value: "32423@qq.com"
                },
                {
                    key: "marryState",
                    value: "0"
                },
                {
                    key: "houseTypeId",
                    value: "0"
                },
                {
                    key: "houseTypeName"
                },
                {
                    key: "propertyAddress",
                    value: ""
                },
                {
                    key: "propertyPost"
                },
                {
                    key: "haveMedical",
                    value: "false"
                },
                {
                    key: "ipAddress"
                },
                {
                    key: "relationId",
                    value: "0"
                },
                {
                    key: "relationName"
                },
                {
                    key: "height"
                },
                {
                    key: "weight"
                },
                {
                    key: "yearlyIncome"
                }
            ],
            insuredPersonAttributeInfoList: [
                [
                    {
                        key: "provCityText",
                        value: "广东省-佛山市-南海区"
                    },
                    {
                        key: "cName",
                        value: "张大牛头人就是本人"
                    },
                    {
                        key: "eName",
                        value: ""
                    },
                    {
                        key: "cardTypeId",
                        value: "2"
                    },
                    {
                        key: "cardTypeName",
                        value: "护照"
                    },
                    {
                        key: "cardNumber",
                        value: "D234388746436qss112"
                    },
                    {
                        key: "cardPeriod"
                    },
                    {
                        key: "sex",
                        value: "0"
                    },
                    {
                        key: "birthdate",
                        value: "1991-01-01"
                    },
                    {
                        key: "countryId",
                        value: "0"
                    },
                    {
                        key: "country"
                    },
                    {
                        key: "provCityId",
                        value: "440000-440600-440605"
                    },
                    {
                        key: "provinceCode"
                    },
                    {
                        key: "provinceName"
                    },
                    {
                        key: "cityCode"
                    },
                    {
                        key: "cityText"
                    },
                    {
                        key: "areaCode"
                    },
                    {
                        key: "areaText"
                    },
                    {
                        key: "jobText"
                    },
                    {
                        key: "jobNum"
                    },
                    {
                        key: "jobLevel"
                    },
                    {
                        key: "jobInfo"
                    },
                    {
                        key: "homeAddress"
                    },
                    {
                        key: "homePost"
                    },
                    {
                        key: "officeAddress"
                    },
                    {
                        key: "officePost"
                    },
                    {
                        key: "tel"
                    },
                    {
                        key: "contactAddress"
                    },
                    {
                        key: "contactPost"
                    },
                    {
                        key: "moblie",
                        value: "13200132111"
                    },
                    {
                        key: "moblieCipher"
                    },
                    {
                        key: "phone"
                    },
                    {
                        key: "email",
                        value: "32423@qq.com"
                    },
                    {
                        key: "marryState",
                        value: "0"
                    },
                    {
                        key: "houseTypeId",
                        value: "0"
                    },
                    {
                        key: "houseTypeName"
                    },
                    {
                        key: "propertyAddress"
                    },
                    {
                        key: "propertyPost"
                    },
                    {
                        key: "haveMedical",
                        value: "false"
                    },
                    {
                        key: "ipAddress"
                    },
                    {
                        key: "relationId",
                        value: "1"
                    },
                    {
                        key: "relationName",
                        value: "本人"
                    },
                    {
                        key: "height"
                    },
                    {
                        key: "weight"
                    },
                    {
                        key: "yearlyIncome"
                    },
                    {
                        key: "buyAmount",
                        value: "1"
                    }
                ]
            ],
            otherAttributeInfoList: [
                {
                    key: "insuranceDate",
                    value: "2016-04-09 00:00:00"
                }
            ],
            inShoppingCart: true,
            tryVerify: true,
            mandatoryAttributeFillSize: null,
            mandatoryAttributeTotalSize: null
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

    it('GET /:id', function (done) {
        var insuranceSlipsId = 20160401001539;
        var path = '/insurance-slips/' + insuranceSlipsId;

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
        var insuranceSlipsId = 20160401001539;
        var path = '/insurance-slips/' + insuranceSlipsId + '/health-inform';

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
        var path = '/insurance-slips/' + insuranceSlipsId + '/health-inform';
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
        var path = '/insurance-slips/groups/parse-excel?fileId=' + fileId;

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
        var path = '/insurance-slips/amount/choosed';
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
});
