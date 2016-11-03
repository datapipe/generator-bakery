'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  github = require('../../lib/github'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:scm:index'),
  _ = require('lodash');

const SCM_TOOLS = ['github', 'github-enterprise'];

var BakeryCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.argument('projectname', {
      type: String,
      required: true
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation',
      default: 'default'
    });
  },

  prompting: function() {

    this.log(bakery.banner('Project Setup!'));

    var prompts = [{
      type: "confirm",
      name: "createscm",
      message: "Attempt to create Source Control repository?",
      default: this.config.get('createscm') || true
    }, {
      type: "list",
      name: "scmtool",
      message: "Source Control Management (SCM) tool:",
      choices: SCM_TOOLS,
      when: function(response) {
        return response.createscm;
      },
      default: this.config.get('scmtool') || SCM_TOOLS[0]
    }, {
      type: "input",
      name: "scmurl",
      message: "Source Control Management URL:",
      when: function(response) {
        return yeoman.createscm != true;
      },
      default: this.config.get('scmurl') || ""
    }];

    return this.prompt(prompts).then(function(props) {
      this.answers = props;
      switch (this.answers.scmtool) {
        case 'github':
        case 'github-enterprise':
          // need to implement this...
          feedback.log('Still need to implement this...');
          break;
        default:
          feedback.warn('SCM toolset ' + this.answers.scmtool + ' is not currently available. Skipping SCM script setup');
          break;
      }
    }.bind(this));
  },

  writing: function() {},

  default: {
    /*saveConfig: function() {
      _.forOwn(this.answers, function(value, key) {
        this.config.set(key, value);
      })
    }*/
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
