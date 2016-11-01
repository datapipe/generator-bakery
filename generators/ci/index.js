'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:lib:github'),
  _ = require('lodash');

const CI_TOOLS = ['jenkins', 'drone'];

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
  },

  prompting: function() {

    this.log(bakery.banner('Continuous Integration!'));

    var prompts = [{
      type: "confirm",
      name: "createci",
      message: "Create CI Scripts?",
      default: true
    }, {
      type: "list",
      name: "citool",
      message: "Continuous Integration (CI) tool:",
      choices: CI_TOOLS,
      when: function(response) {
        return response.createci;
      }
    }];

    return this.prompt(prompts).then(function(props) {
      this.props = props;
      process.env.CI_TYPE = this.props.citool;
      switch (this.props.citool) {
        case 'drone':
          //do something
          break;
        case 'jenkins':
          //do something
          break;
        default:
          this.log.error('CI toolset ' + this.options.citool + ' is not currently available. Skipping CI script setup');
          break;
      }
    }.bind(this));
  },

  writing: function() {

  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
