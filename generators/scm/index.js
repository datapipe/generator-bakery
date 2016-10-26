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

    this.option('scmtool', {
      desc: 'Specify the SCM Toolset to be used',
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

    var prompts = [];
    
    this.log(yosay(
      '... Configuration Management Details!'
    ));

    return this.prompt(prompts).then(function (props) {
      switch (this.options.scmtool){
        case 'github':
        case 'github-enterprise':
          this.composeWith('github-create:authenticate', {}, {});
          this.composeWith('github-create:create', {
            options: {
              name: this.options.projectname
            }}, {});
          break;
        default:
          this.log.error('SCM toolset ' + this.options.scmtool + ' is not currently available. Skipping SCM script setup');
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
