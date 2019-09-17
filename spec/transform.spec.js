const { expect } = require('chai');
const eioUtils = require('elasticio-node').messages;
const sinon = require('sinon');
const transform = require('../lib/actions/transform');

const testData = {
  phone: [
    '12345678', '87654321',
  ],
};

describe('Transformation test', () => {
  let self;

  beforeEach(() => {
    self = {
      emit: sinon.spy(),
    };
  });

  it('should handle simple transforms', () => transform.process.call(self, eioUtils.newMessageWithBody({
    first: 'Renat',
    last: 'Zubairov',
  }), {
    expression: '{ "fullName": first & " " & last }',
  }).then(() => {
    expect(self.emit.args[0][1].body).to.deep.equal({
      fullName: 'Renat Zubairov',
    });
  }));

  it('should not produce an empty message if transformation returns undefined', () => transform.process.call(self, eioUtils.newMessageWithBody({
    first: 'Renat',
    last: 'Zubairov',
  }), {
    expression: '$[foo=2].({ "foo": boom })',
  }).then(() => {
    expect(self.emit.called).to.be.equal(false);
  }));

  it('should return an array when the checkbox is selected', () => transform.process.call(self, eioUtils.newMessageWithBody(testData), {
    expression: 'phone',
    dontSplitArray: true,
  }).then(() => {
    expect(self.emit.args[0][1].body).to.deep.equal([
      '12345678', '87654321',
    ]);
  }));

  it('should return multiple objects when checkbox is deselected', async () => transform.process.call(self, eioUtils.newMessageWithBody(testData), {
    expression: 'phone',
    dontSplitArray: false,
  }).then(() => {
    expect(self.emit.calledTwice).to.be.equal(true); // emits twice
    expect(self.emit.args[0][1].body).to.deep.equal('12345678');
    expect(self.emit.args[1][1].body).to.deep.equal('87654321');
  }));

  it('should return multiple objects when checkbox field is undefined', async () => transform.process.call(self, eioUtils.newMessageWithBody(testData), {
    expression: 'phone',
  }).then(() => {
    expect(self.emit.calledTwice).to.be.equal(true); // emits twice
  }));

  it('should handle passthough properly', () => {
    const msg = eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    });
    msg.passthrough = {
      ps: 'psworks',
    };
    return transform.process.call(self, msg, {
      expression: '{ "fullName": first & " " & elasticio.ps}',
    }).then(() => {
      expect(self.emit.args[0][1].body).to.deep.equal({
        fullName: 'Renat psworks',
      });
    });
  });
});
