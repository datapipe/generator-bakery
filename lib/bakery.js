/**
 * @module
 */
'use strict';

const figlet = require('figlet');

/**
 * Create the Splat banner.
 *
 * @param {Promise.<string>} The plain text string to stylize.
 * @returns {Promise.<string>} The banner as a string
 */
function banner(header) {
  return figlet.textSync(header, {
    font: 'Cricket',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })};

module.exports = {
  banner
}
