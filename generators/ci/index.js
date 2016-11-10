'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:ci:index'),
  _ = require('lodash');

const CI_TOOL_JENKINS = 'jenkins';
const CI_TOOL_DRONE = 'drone';
const CI_TOOLS = [ CI_TOOL_JENKINS, CI_TOOL_DRONE ];

var BakeryCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';
  },

  initializing: function() {
    let gen_defaults = {
      ci: {
        active: true,
        citool: CI_TOOL_JENKINS
      }
    }

    this.config.defaults(gen_defaults);
  },

  prompting: function() {

    this.log(bakery.banner('Continuous Integration!'));

    let ciInfo = this.config.get('ci');

    var prompts = [{
      type: "confirm",
      name: "createci",
      message: "Create CI Scripts?",
      default: ciInfo.active
    }, {
      type: "list",
      name: "citool",
      message: "Continuous Integration (CI) tool:",
      choices: CI_TOOLS,
      when: function(response) {
        return response.createci;
      },
      default: ciInfo.citool
    }];

    return this.prompt(prompts).then(function(props) {
      let ciInfo = {
        active: props.createci,
        citool: props.citool
      };
      this.config.set('ci', ciInfo);
      this.config.save();

    }.bind(this));
  },

  default: {
  },

  writing: function() {
    var file = "";
    let ciInfo = this.config.get('ci');
    switch (ciInfo.createci) {
      case CI_TOOL_DRONE:
        file = ".drone.yml";
        break;
      case CI_TOOL_JENKINS:
        file = "Jenkinsfile.xml";
        break;
      default:
        feedback.warn('CI toolset ' + ciInfo.createci + ' is not currently available. Skipping CI script setup.');
        break;
    };
    if (file != "") {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        replacements
      );
    }
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
