/* eslint no-invalid-this: 0 no-console: 0 */
const eioUtils = require('elasticio-node').messages;
const jsonata = require('@elastic.io/jsonata-moment');
const debug = require('debug')('jsonata');

const PASSTHROUGH_BODY_PROPERTY = 'elasticio';

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const expression = cfg.expression;
  const compiledExpression = jsonata(expression);
  handlePassthrough(msg);
  debug('Evaluating expression="%s" on body=%j', expression, msg.body);
  const result = compiledExpression.evaluate(msg.body);
  debug('Evaluation completed, result=%j', result);
  if (result === undefined || result === null || Object.keys(result).length === 0) {
    return Promise.resolve();
  }
  if (typeof result[Symbol.iterator] === 'function') {
        // We have an iterator as result
    for (const item of result) {
      await this.emit('data', eioUtils.newMessageWithBody(item));
    }
    return Promise.resolve();
  }
  return Promise.resolve(eioUtils.newMessageWithBody(result));
}

function handlePassthrough(message) {
  if (message.passthrough && Object.keys(message.passthrough)) {
    if (PASSTHROUGH_BODY_PROPERTY in message.body) {
      throw new Error(`${PASSTHROUGH_BODY_PROPERTY} property is reserved \
            if you are using passthrough functionality`);
    }

    message.body.elasticio = {};
    Object.assign(message.body.elasticio, message.passthrough);
  }
  return message;
}

module.exports.process = processAction;
