var should = require('should');
var Validator = require('../../lib/validator');

describe('Validator', function () {
    it('isDateString', function (done) {
        var str = '2016-13-01';
        new Validator(str).isNotEmpty().isDateString().validate()
            .then(function (result) {
                console.log(result);
                done();
            })
            .catch(function (error) {
                done(error);
            });
    });
});