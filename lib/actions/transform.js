const { JsonataTransform } = require('@elastic.io/component-commons-library');
const eioUtils = require('elasticio-node').messages;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  const result = JsonataTransform.jsonataTransform(msg, cfg);

  if (result === undefined || result === null || Object.keys(result).length === 0) {
    return;
  }

  if (typeof result[Symbol.iterator] === 'function' && !cfg.dontSplitArray) {
    // We have an iterator as result
    result.forEach(async (item) => {
      await this.emit('data', eioUtils.newMessageWithBody(item));
    });
    return;
  }

  await this.emit('data', eioUtils.newMessageWithBody(result));
}

module.exports.process = processAction;
