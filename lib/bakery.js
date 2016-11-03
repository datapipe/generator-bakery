/**
 * @module
 */
'use strict';

const figlet = require('figlet'),
           _ = require('lodash'),
         aws = require('aws-sdk'),
    feedback = require('./feedback');


var ec2 = new aws.EC2();

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

function validateAMIId(amiId, options) {
  if (options.aws_profile !== undefined) {
    aws.config.credentials(aws.SharedIniFileCredentials({profile: aws_profile}));
    debug('Set AWS credentials profile to ' + options.aws_profile);
  };
  if (options.aws_region !== undefined) {
    aws.config.update(options.aws_region);
    debug('Set AWS region to ' + options.aws_region);
  }
  else {
    aws.config.update('us-west-2');
    debug('Set AWS region to default us-west-2');
  };
  var params = {
    DryRun: false,
    Filters: [
      ImageIds: [
        amiId
      ]]};
  aws.ec2.describeImages(params, function(err, data) {
    if (err) {
      feedback.error(err);
    }
    else {
      feedback.info(data);
    }
  });
}

// issue # 12 - os type flag for packer provisioner switch....
function osType(amiId, regionName) {
  return 'unix';
};

module.exports = {
  banner,
  validateEnv
}
