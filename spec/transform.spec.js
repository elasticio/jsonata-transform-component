/* eslint-disable arrow-body-style */

const { expect } = require('chai');
const logger = require('@elastic.io/component-commons-library').getLogger();
const { messages } = require('../lib/utils');
const transform = require('../lib/actions/transform');

describe('Transformation test', () => {
  it('should handle simple transforms', () => {
    return transform.process.call({ logger }, messages.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    }), {
      expression: '{ "fullName": first & " " & last }',
    }).then((result) => {
      expect(result.body).to.deep.equal({
        fullName: 'Renat Zubairov',
      });
    });
  });

  it('should not produce an empty message if transformation returns undefined', () => {
    return transform.process.call({ logger }, messages.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    }), {
      expression: '$[foo=2].({ "foo": boom })',
    }).then((result) => {
      expect(result).to.be.an('undefined');
    });
  });

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

  it('should handle getFlowVariables properly', () => {
    const msg = messages.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    });
    msg.passthrough = {
      ps: 'psworks',
    };
    const flowVariables = {
      var1: 'value1',
      var2: 'value2',
    };
    return transform.process.call({ logger, getFlowVariables: () => flowVariables }, msg, {
      expression: '$getFlowVariables()',
    }).then((result) => {
      expect(result.body).to.deep.equal(flowVariables);
    });
  });

  it('should call getPassthrough', () => {
    const msg = messages.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    });
    msg.passthrough = {
      ps: 'psworks',
    };
    return transform.process.call({ logger }, msg, {
      expression: '$getPassthrough()',
    }).then((result) => {
      expect(result.body).to.deep.equal({
        ps: 'psworks',
      });
    });
  });
});
