'use strict';
const expect = require('chai').expect;
const transform = require('../lib/actions/transform');
const eioUtils = require('elasticio-node').messages;
const EventEmitter = require('events');

class TestEmitter extends EventEmitter {

  constructor(done) {
    super();
    this.data = [];
    this.end = 0;
    this.error = [];

    this.on('data', value => this.data.push(value));
    this.on('error', value => {
      this.error.push(value);
      console.error(value.stack || value);
    });
    this.on('end', () => {
      this.end++;
      done();
    });
  }

}

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

  it('should not produce multiple messages when transformation result is an array', () => {
    const emitter = new TestEmitter();
    return transform.process.call(emitter, eioUtils.newMessageWithBody({
      items: [
                {id: 'one'},
                {id: 'two'}
      ]
    }), {
      expression: `items`
    }).then(result => {
      expect(result).to.be.an('undefined');
      expect(emitter.data.length).to.be.equal(2);
      expect(emitter.data[0].body).to.be.deep.equal({id: 'one'});
      expect(emitter.data[1].body).to.be.deep.equal({id: 'two'});
    });
  });
});
