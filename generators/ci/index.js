'use strict';
const yeoman = require('yeoman-generator'),
       chalk = require('chalk'),
       yosay = require('yosay'),
      bakery = require('../../lib/bakery');

const CI_TOOLS = ['jenkins', 'drone'];

var BakeryCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.option('projectname', {
      desc: 'Name of the project being created',
      type: String,
      alias: 'n'
    });
  },

  prompting: function () {

    this.log(bakery.banner('Source Control'));

    var prompts = [{
      type: "confirm",
      name: "createci",
      message: "Create CI Scripts?",
      default: true
    },
    {
      type: "list",
      name: "citool",
      message: "Continuous Integration (CI) tool:",
      choices: CI_TOOLS,
      when: function(response) {
        return response.create_ci;
      }
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;

      switch (this.props.citool){
        case 'drone':
          //do something
          break;
        case 'jenkins':
          //do something
          break;
        default:
          this.log.error('CI toolset ' + this.options.citool + ' is not currently available. Skipping CI script setup');
          break;}
    }.bind(this));
  },

  writing: function () {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
