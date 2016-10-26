'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const AWS_REGIONS = [{name: 'us-east-1'}, {name: 'us-east-2'}, {name: 'us-west-1'}, {name: 'us-west-2'}, {name: 'ap-south-1'}, {name: 'ap-northeast-1'}, {name: 'ap-southeast-1'}, {name: 'ap-southeast-2'}, {name: 'ap-northeast-1'}, {name: 'eu-central-1'}, {name: 'eu-west-1'}, {name: 'sa-east-1'}];
const AWS_INSTANCE_TYPES = ['t2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large', 'm4.large', 'm4.xlarge', 'm4.2xlarge', 'm4.4xlarge', 'm4.8xlarge', 'm4.16xlarge', 'c4.large', 'c4.xlarge', 'c4.2xlarge', 'c4.4xlarge', 'c4.8xlarge'];

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
      '... Continuous Integration Details!'
    ));

    var prompts = [{
      type: "confirm",
      name: "createami",
      message: "Create Amazon Machine Image?",
      default: true
    },
    {
      type: "checkbox",
      name: "awsregions",
      message: "Choose AWS Region(s) for creation",
      choices: AWS_REGIONS,
      when: function (response) {
        return response.createami;
      },
      default: 'us-west-2'
    },
    {
      type: "choice",
      name: "parallelorcopy",
      message: "Build in parallel or build and copy?",
      choices: ['parallel', 'copy'],
      when: function (response) {
        return (response.createami && response.awsregions.length > 1);
      },
      default: 'copy'
    },
    {
      type: 'list',
      name: 'primaryregion',
      message: 'Choose a primary region for building in AWS:',
      when: function(response) {
        return (response.parallelorcopy == 'copy' && response.awsregions.length > 1);
      },
      choices: function(response) {
        return response.awsregions;
      }
    },
    {
      type: 'list',
      name: 'buildimagetype',
      message: 'Instance Type for build:',
      default: 't2.large',
      choices: AWS_INSTANCE_TYPES,
      when: function (response) {
        return response.createami;
      }
    },
    {
      type: 'input',
      name: 'regionSpecificAmi',
      message: 'Region-specific base AMI',
      when: function(response) {
        return response.createami && response.parallelorcopy == 'copy';
      }
    }];

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
