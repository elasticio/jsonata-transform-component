/* eslint no-invalid-this: 0 no-console: 0 */
'use strict';
const eioUtils = require('elasticio-node').messages;
const jsonata = require('jsonata');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  const expression = cfg.expression;
  console.log('Evaluating expression="%s"', expression);
  const compiledExpression = jsonata(expression);
  const result = compiledExpression.evaluate(msg.body);
  console.log('Evaluation completed, result=%j', result);
  return Promise.resolve(eioUtils.newMessageWithBody(result));
}

module.exports.process = processAction;
