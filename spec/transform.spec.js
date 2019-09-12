/* eslint-disable arrow-body-style */

const expect = require('chai').expect;
const transform = require('../lib/actions/transform');
const eioUtils = require('elasticio-node').messages;
const sinon = require('sinon');

const testData = {
  phone: [
    '12345678', '87654321'
  ]
};

describe('Transformation test', () => {
  let self;

  beforeEach(() => {
    self = {
      emit: sinon.spy()
    };
  });

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

  it('should return an array when the checkbox is selected', () => {
    return transform.process(eioUtils.newMessageWithBody(testData), {
      expression: 'phone',
      dontSplitArray: true
    }).then(result => {
      expect(result.body).to.deep.equal([
        '12345678', '87654321'
      ]);
    });
  });

  it('should return multiple objects when checkbox is deselected', async () => {
    return transform.process.call(self, eioUtils.newMessageWithBody(testData), {
      expression: 'phone',
      dontSplitArray: false
    }).then(() => {
      expect(self.calledTwice); // emits twice
    });
  });

  it('should return multiple objects when checkbox field is undefined', async () => {
    return transform.process.call(self, eioUtils.newMessageWithBody(testData), {
      expression: 'phone'
    }).then(() => {
      expect(self.calledTwice); // emits twice
    });
  });

  it('should handle passthough properly', () => {
    const msg = eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov'
    });
    msg.passthrough = {
      ps: 'psworks'
    };
    return transform.process(msg, {
      expression: `{ "fullName": first & " " & elasticio.ps}`
    }).then(result => {
      expect(result.body).to.deep.equal({
        fullName: 'Renat psworks'
      });
    });
  });
});
