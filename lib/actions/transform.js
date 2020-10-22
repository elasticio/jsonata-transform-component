const eioUtils = require('elasticio-node').messages;
const { JsonataTransform } = require('@elastic.io/component-commons-library');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  let result;
  try {
    result = JsonataTransform.jsonataTransform(msg, cfg, this);
  } catch (e) {
    this.logger.error('Jsonata transformation failed!');
    throw new Error('Jsonata transformation failed!');
  }
  this.logger.info('Evaluation completed');
  if (result === undefined || result === null || Object.keys(result).length === 0) {
    return Promise.resolve();
  }

  if (typeof result[Symbol.iterator] === 'function') {
    // We have an iterator as result
    // eslint-disable-next-line no-restricted-syntax
    for (const item of result) {
      // eslint-disable-next-line no-await-in-loop
      await this.emit('data', eioUtils.newMessageWithBody(item));
    }

    return Promise.resolve();
  }

  return Promise.resolve(eioUtils.newMessageWithBody(result));
}

module.exports.process = processAction;
