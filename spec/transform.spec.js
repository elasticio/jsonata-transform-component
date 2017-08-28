'use strict';
const expect = require('chai').expect;
const transform = require('../lib/actions/transform');
const eioUtils = require('elasticio-node').messages;

describe('Transformation test', () => {

    it('should handle simple transforms', () => {
        return transform.process(eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov'
        }), {
            expression: `{ "fullName": first & " " & last }`
        }).then(result => {
            expect(result.body).to.deep.equal({
                fullName: 'Renat Zubairov'
            });
        });
    });

    it('should not produce an empty message if transformation returns undefined', () => {
        return transform.process(eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov'
        }), {
            expression: `$[foo=2].({ "foo": boom })`
        }).then(result => {
            expect(result).to.be.an('undefined');
        });
    });


});
