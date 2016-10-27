/**
 * @module
 */
'use strict';

const figlet = require('figlet'),
           _ = require('lodash');

/**
 * Create the Splat banner.
 *
 * @param {Promise.<string>} The plain text string to stylize.
 * @returns {Promise.<string>} The banner as a string
 */
function banner(header) {
  return figlet.textSync(header, {
    font: 'Short',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })};

/**
 * Check environemnt variables that should be present.
 *
 * @oaram {<array>} List of environment variable names
 * @return {Promise}
 */
function validateEnv(envVars) {
  let missing = _.reject(envVars, env => process.env[env]);
  if (missing.length) {
    return Promise.reject(new Error('You must define ${missing.join(', ')} in your environment variables'));
  }
  return Promise.resolve();
};

// issue # 12 - os type flag for packer provisioner switch....
function osType(amiId, regionName) {
  return 'unix';
};

module.exports = {
  banner,
  validateEnv
}
