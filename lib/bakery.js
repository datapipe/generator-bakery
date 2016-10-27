/**
 * @module
 */
'use strict';

const figlet = require('figlet'),
      colors = require('colors');

/**
 * Create the Splat banner.
 *
 * @param {Promise.<string>} The plain text string to stylize.
 * @returns {Promise.<string>} The banner as a string
 */
function banner(header) {
  return new Promise((resolve, reject) => {
    figlet(header, {font: 'Cricket'}, (err, data) => {
      if (err) return reject(err);
      resolve(colors.green(data));
    });
  });
}

module.exports = {
  banner
}
