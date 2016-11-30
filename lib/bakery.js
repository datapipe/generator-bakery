/**
 * @module
 */
'use strict';

var figlet = require('figlet');
var _ = require('lodash');
var aws = require('aws-sdk');
var debug = require('debug')('bakery:lib:bakery');
var feedback = require('./feedback');

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
  });
}

/**
 * Check environemnt variables that should be present.
 *
 * @oaram {<array>} List of environment variable names
 * @return {Promise}
 */
function validateEnv(envVars) {
  let missing = _.reject(envVars, env => process.env[env]);
  if (missing.length) {
    return Promise.reject(new Error('You must define ${missing.join(',
      ')} in your environment variables'));
  }
  return Promise.resolve();
}

/**
 * Check environemnt variables that should be present.
 *
 * @oaram amiId {String} ID of the AMI to find
 * @param options {object} object optionally containing aws profile and region details
 * @return {Promise}
 */
function validateAMIId(amiId, options) {
  setupAWSAPI(options);
  var ec2 = new aws.EC2();
  var params = {
    DryRun: false,
    ImageIds: [
      amiId
    ]
  };
  return new Promise(function (resolve, reject) {
    var returnVal = false;
    var msg = '';
    var test = ec2.describeImages(params, function (err, data) {
      if (err) {
        feedback.warn('Could not find image: ' + err.message);
        return resolve(returnVal);
      } else {
        if (data.Images.length === 1) {
          if (data.Images[0].Platform && data.Images[0].Platform ===
            'windows') {
            process.env.WINDOWSIMAGE = true;
          }
          process.env.AWSIMAGENAME = data.Images[0].Name;
          feedback.info('Found AMI ' + amiId + ' in region ' + options.awsregion);
          returnVal = true;
        } else if (data.Images.length > 1) {
          msg = 'Inexplicably we found ' + data.Images.length +
            ' Images for id ' + amiId + ' in region ' + options.awsregion;
          feedback.warn(msg);
          return reject(msg);
        } else {
          msg = 'No AMI found for id ' + amiId + ' in region ' +
            options.awsregion;
          feedback.warn(msg);
          return reject(msg);
        }
      }
      return resolve(returnVal);
    });
  });
}

function setupAWSAPI(options) {
  if (options.awsprofile && options.awsprofile !== '') {
    aws.config.credentials = new aws.SharedIniFileCredentials({
      profile: options.awsprofile
    });
    debug('Set AWS credentials profile to ' + options.awsprofile);
  }
  var awsregion = options.awsregion || 'us-west-2';
  aws.config.update({
    region: awsregion
  });
  debug('Set AWS region to ' + awsregion);
}

module.exports = {
  banner,
  validateEnv,
  validateAMIId
};
