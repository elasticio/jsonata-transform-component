const { messages } = require('elasticio-node');
const jsonata = require('@elastic.io/jsonata-moment');

const PASSTHROUGH_BODY_PROPERTY = 'elasticio';

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const { expression } = cfg;
  const compiledExpression = jsonata(expression);
  // eslint-disable-next-line no-use-before-define
  handlePassthrough(msg);
  this.logger.info('Evaluating expression="%s" on body=%j', expression, msg.body);
  const result = compiledExpression.evaluate(msg.body);
  this.logger.info('Evaluation completed, result=%j', result);
  if (result === undefined || result === null || Object.keys(result).length === 0) {
    return Promise.resolve();
  }
  if (typeof result[Symbol.iterator] === 'function') {
    // We have an iterator as result
    // eslint-disable-next-line no-restricted-syntax
    for (const item of result) {
      // eslint-disable-next-line no-await-in-loop
      await this.emit('data', messages.newMessageWithBody(item));
    }
    return Promise.resolve();
  }
  return Promise.resolve(messages.newMessageWithBody(result));
}

function handlePassthrough(message) {
  if (message.passthrough && Object.keys(message.passthrough)) {
    if (PASSTHROUGH_BODY_PROPERTY in message.body) {
      throw new Error(`${PASSTHROUGH_BODY_PROPERTY} property is reserved \
            if you are using passthrough functionality`);
    }

    // eslint-disable-next-line no-param-reassign
    message.body.elasticio = {};
    Object.assign(message.body.elasticio, message.passthrough);
  }
  return message;
}

module.exports.process = processAction;
