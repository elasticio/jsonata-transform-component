const { expect } = require('chai');
const { messages } = require('elasticio-node');
const logger = require('@elastic.io/component-logger')();

const transform = require('../lib/actions/transform');

describe('Transformation test', () => {
  it('should handle simple transforms', () => transform.process.call({ logger }, messages.newMessageWithBody({
    first: 'Renat',
    last: 'Zubairov',
  }), {
    expression: '{ "fullName": first & " " & last }',
  }).then((result) => {
    expect(result.body).to.deep.equal({
      fullName: 'Renat Zubairov',
    });
  }));

  it('should not produce an empty message if transformation returns undefined', () => transform.process.call({ logger }, messages.newMessageWithBody({
    first: 'Renat',
    last: 'Zubairov',
  }), {
    expression: '$[foo=2].({ "foo": boom })',
  }).then((result) => {
    expect(result).to.be.an('undefined');
  }));

  it('should handle passthough properly', () => {
    const msg = messages.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    });
    msg.passthrough = {
      ps: 'psworks',
    };
    return transform.process.call({ logger }, msg, {
      expression: '{ "fullName": first & " " & elasticio.ps}',
    }).then((result) => {
      expect(result.body).to.deep.equal({
        fullName: 'Renat psworks',
      });
    });
  });
});
