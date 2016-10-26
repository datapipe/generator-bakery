'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var ImageBuildCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.option('citype', {
      desc: 'Specify the CI Toolset to be used',
      type: String,
      alias: 't'
    });


    this.option('projectname', {
      desc: 'Name of the project being created',
      type: String,
      alias: 'n'
    });
  },

  prompting: function () {
    this.log(yosay(
      '... Configuration Management Details!'
    ));

    return this.prompt(prompts).then(function (props) {
      switch (this.options.citype){
        case 'drone':
          //do something
          break;
        case 'jenkins':
          //do something
          break;
        default:
          this.log.error('CI toolset ' + this.options.citype + ' is not currently available. Skipping CI script setup');
          break;}
    }.bind(this));
  },

  writing: function () {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = ImageBuildCI;
