'use strict';
const yeoman = require('yeoman-generator'),
       chalk = require('chalk'),
       yosay = require('yosay'),
      bakery = require('../../lib/bakery'),
      github = require('../../lib/github'),
    feedback = require('../../lib/feedback'),
       debug = require('debug')('bakery:lib:github'),
           _ = require('lodash');

const LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3', 'MIT', 'ISC'];
const CM_TOOLS = ['chef', 'puppet', 'bash'];

var BakeryCM = yeoman.Base.extend({

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

    var gitUser = github.getGitUser();
    this.user = gitUser || {};
  },

  prompting: function () {
    this.log(bakery.banner('Configuration Management!'));
    var userInfo = github.getGitUser() || {};
    var prompts = [
    {
      type: 'list',
      name: 'license',
      message: 'Choose a license to apply to the new project:',
      choices: LICENSES
    },
    {
      type: "list",
      name: "cmtool",
      message: "Configuration Management (CM) tool:",
      choices: CM_TOOLS
    },
    {
      type: 'input',
      name: 'authorname',
      message: "Enter the author's full name or organization:",
      default: userInfo.name
    },
    {
        type: 'input',
        name: 'authoremail',
        message: "Enter the author or organization's email:",
        default: userInfo.email
    },
    {
        type: 'input',
        name: 'shortdescription',
        message: 'Enter a short description of the project:'
    },
    {
        type: 'input',
        name: 'longdescription',
        message: 'Enter a long description of the project:'
    },
    {
        type: 'input',
        name: 'issuesurl',
        message: 'Enter the issues URL:'
    },
    {
        type: 'input',
        name: 'sourceurl',
        message: 'Enter the source URL:'
    },
    {
        type: 'input',
        name: 'projecturl',
        message: 'Enter the project URL for this module:',
        when: function(response) {
          return response.cmtool == 'puppet';
        }
    }
  ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;

      // load to global to share with other components easily
      process.env.CM_TYPE = this.props.cmtool;

      switch (this.props.cmtool){
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
      license: this.props.license,
      project_name: process.env.PROJECTNAME,
      author_name: this.props.authorname,
      author_email: this.props.authoremail,
      short_description: this.props.shortdescription,
      long_description: this.props.longdescription,
      source_url: this.props.sourceurl,
      pronect_url: this.props.projecturl,
      issues_url: this.props.issuesurl
    }
  },

  _chefRepoBase: function(replacementVariables) {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = BakeryCM;
