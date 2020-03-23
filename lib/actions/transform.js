/* eslint no-invalid-this: 0 no-console: 0 */

const eioUtils = require('elasticio-node').messages;
const {JsonataTransform} = require('@elastic.io/component-commons-library');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const result = JsonataTransform.jsonataTransform(msg, cfg, this);
  this.logger.info('Evaluation completed, result=%j', result);
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

module.exports.process = processAction;
