'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  github = require('../../lib/github'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:cm:index'),
  glob = require('glob'),
  path = require('path'),
  _ = require('lodash');

const LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3', 'MIT', 'ISC'];
const CM_TOOLS = ['chef', 'puppet', 'bash'];

var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};
    this.argument('projectname', {
      type: String,
      required: true
    });
    var gitUser = github.getGitUser();
    this.user = gitUser || {};
  },

  prompting: function() {
    this.log(bakery.banner('Configuration Management!'));
    var userInfo = github.getGitUser() || {};
    var prompts = [{
      type: 'list',
      name: 'license',
      message: 'Choose a license to apply to the new project:',
      choices: LICENSES,
      required: true
    }, {
      type: "list",
      name: "cmtool",
      message: "Configuration Management (CM) tool:",
      choices: CM_TOOLS,
      required: true
    }, {
      type: 'input',
      name: 'authorname',
      message: "Enter the author's full name or organization:",
      default: userInfo.name,
      required: true
    }, {
      type: 'input',
      name: 'authoremail',
      message: "Enter the author or organization's email:",
      default: userInfo.email
    }, {
      type: 'input',
      name: 'shortdescription',
      message: 'Enter a short description of the project:',
      required: true
    }, {
      type: 'input',
      name: 'longdescription',
      message: 'Enter a long description of the project:',
      required: true
    }, {
      type: 'input',
      name: 'issuesurl',
      message: 'Enter the issues URL:',
      required: true
    }, {
      type: 'input',
      name: 'sourceurl',
      message: 'Enter the source URL:',
      required: true
    }, {
      type: 'input',
      name: 'projecturl',
      message: 'Enter the project URL for this module:',
      when: function(response) {
        return response.cmtool == 'puppet';
      },
      required: function(response) {
        return response.cmtool == 'puppet';
      }
    }];

    return this.prompt(prompts).then(function(props) {
      // To access props later use this.props.someAnswer;
      this.answers = props;

      // load to global to share with other components easily
      process.env.CM_TYPE = this.answers.cmtool;
    }.bind(this));
  },

  writing: function() {
    var replacements = {
      license: this.answers.license,
      project_name: process.env.PROJECTNAME,
      author_name: this.answers.authorname,
      author_email: this.answers.authoremail,
      short_description: this.answers.shortdescription,
      long_description: this.answers.longdescription,
      source_url: this.answers.sourceurl,
      pronect_url: this.answers.projecturl,
      issues_url: this.answers.issuesurl
    };

    var fileList = [];
    switch (process.env.CM_TYPE) {
      case 'puppet':
        fileList = glob(path.basename(__dirname).join('/templates/puppet/**/*'), function(err, files) {
          return files;
        });
        debug('Puppet repo setup');
        debug(filelist);
        break;
      case 'chef':
        fileList = glob(path.basename(__dirname).join('/templates/chef/**/*'), function(err, files) {
          return files;
        });
        debug('Chef repo setup');
        debug(filelist);
        break;
      default:
        this.log.error('CM tool ' + process.env.CM_TYPE + ' is not yet implemented. Ignoring CM setup');
        break;
    }
  },

  _chefRepoBase: function(replacementVariables) {

  },

  _puppetRepoBase: function(replacementVariables) {

  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCM;
