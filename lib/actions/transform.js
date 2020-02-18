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
  const messageCopy = handlePassthrough(msg);
  this.logger.info('Evaluating expression="%s" on body=%j', expression, messageCopy.body);
  const result = compiledExpression.evaluate(messageCopy.body);
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
    // eslint-disable-next-line consistent-return
    return;
  }
  return messages.newMessageWithBody(result);
}

function handlePassthrough(message) {
  const messageCopy = JSON.parse(JSON.stringify(message));
  if (message.passthrough && Object.keys(message.passthrough)) {
    if (PASSTHROUGH_BODY_PROPERTY in message.body) {
      throw new Error(`${PASSTHROUGH_BODY_PROPERTY} property is reserved \
            if you are using passthrough functionality`);
    }

    messageCopy.body.elasticio = {};
    Object.assign(messageCopy.body.elasticio, message.passthrough);
  }
  return messageCopy;
}

module.exports.process = processAction;
