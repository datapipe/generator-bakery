'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  github = require('../../lib/github'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:scm:index'),
  _ = require('lodash');

const SCM_TOOL_GITHUB = 'github';
const SCM_TOOLS = [ SCM_TOOL_GITHUB ];

var BakeryCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    let default_config = {
      scm: {
        active: true,
        scmtool: SCM_TOOL_GITHUB,
        scmhost: 'github.com'
      }
    }
    this.config.defaults(default_config);
  },

  prompting: function() {
    this.log(bakery.banner('Project Setup!'));

    let scmInfo = this.config.get('scm');

    var prompts = [{
      type: "confirm",
      name: "createscm",
      message: "Attempt to create Source Control repository?",
      default: scmInfo.active
    }, {
      type: "list",
      name: "scmtool",
      message: "Source Control Management (SCM) tool:",
      choices: SCM_TOOLS,
      when: function(response) {
        return response.createscm;
      },
      default: scmInfo.scmtool
    }, {
      type: "input",
      name: "scmhost",
      message: "Source Control Management hostname:",
      when: function(response) {
        return response.createscm != true;
      },
      default: scmInfo.scmhost
    }, {
      type: "input",
      name: "organization",
      message: "Organization:",
      when: function(response) {
        return response.createscm != true;
      },
      default: scmInfo.organization
    }, {
      type: "input",
      name: "repository",
      message: "Repository name:",
      when: function(response) {
        return response.createscm != true;
      },
      default: scmInfo.repository
    }
    ];

    return this.prompt(prompts).then(function(props) {
      let scmInfo = {
        active: props.createscm,
        scmtool: props.scmtool,
        scmhost: props.scmhost,
        organization: props.organization,
        repository: props.repository
      }
      this.config.set('scm', scmInfo);
      this.config.save();
    }.bind(this));
  },

  writing: function() {
    switch (this.config.get('scmtool')) {
      case 'github':
      case 'github-enterprise':
        // need to implement this...
        break;
      default:
        feedback.warn('SCM toolset ' + this.config.get('scmtool') + ' is not currently available. Skipping SCM script setup');
        break;
    }
  },

  default: {
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
