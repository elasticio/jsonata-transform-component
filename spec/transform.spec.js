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

  it('should emit each item as separate message when evaluation result is an array', async () => {
    const emitted = [];
    const context = {
      logger,
      emit: (event, data) => {
        if (event === 'data') {
          emitted.push(data);
        }
        return Promise.resolve();
      },
    };
    const msg = messages.newMessageWithBody({
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    });
    const cfg = {
      expression: 'items',
    };

    await transform.process.call(context, msg, cfg);
    expect(emitted).to.have.lengthOf(2);
    expect(emitted[0].body).to.deep.equal({ id: 1, name: 'Item 1' });
    expect(emitted[1].body).to.deep.equal({ id: 2, name: 'Item 2' });
  });

  it('should log error message and throw informative error on transformation failure', async () => {
    let loggedErrorMsg = '';
    const mockLogger = {
      info: () => {},
      error: (msg) => {
        loggedErrorMsg = msg;
      },
    };
    const msg = messages.newMessageWithBody({
      first: 'Renat',
    });
    const cfg = {
      expression: '{ "invalid": ',
    };

    try {
      await transform.process.call({ logger: mockLogger }, msg, cfg);
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('Jsonata transformation failed:');
      expect(loggedErrorMsg).to.include('Jsonata transformation failed:');
    }
  });
});
