'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var aws_helper = require('../../lib/aws.js');

module.exports = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.option('cmtype', {
      desc: 'Specify the Configuration Management toolset to be used',
      type: String,
      alias: 't'
    });

    this.option('projectdetails', {
      desc: 'Name of the project being created',
      type: String,
      alias: 'p'
    });

    this.option('license', {
      desc: 'License type to use for this project',
      type: String,
      alias: 'n'
    });

    this.option('cloudinfo', {
      desc: 'Details pertaining to the cloud setup for building images',
      type: Object,
      alias: 'c'
    })
  },

  prompting: function () {
    this.log(yosay(
      '... Configuration Management Details!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'someAnswer',
      message: 'Would you like to enable this option?',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
      switch (this.options.cmtype){
        case 'puppet':
          break;
        case 'chef':
          break;
        default:
          this.log.error('CM toolset ' + this.options.cmtype + ' is not currently available. Skipping CM script setup');
          break;};
    }.bind(this));
  },

  writing: function () {
    var replacements = {
      license: this.options.license,
      projectname: this.options.projectdetails.name,
    }
  },

  install: function () {
    this.installDependencies();
  }
});
