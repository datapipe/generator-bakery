'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3', 'MIT', 'ISC'];
const CM_TOOLS = ['chef', 'puppet', 'bash'];

module.exports = yeoman.Base.extend({

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
    this.log(yosay(
      '... Configuration Management Details!'
    ));

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
      message: "Enter the author's full name or organization:"
    },
    {
        type: 'input',
        name: 'authoremail',
        message: "Enter the author or organization's email:"
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
      switch (this.props.cmtype){
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
      project_name: this.options.projectname,
      author_name: this.props.authorname,
      author_email: this.props.authoremail,
      short_description: this.props.shortdescription,
      long_description: this.props.longdescription,
      license: this.props.license,
      source_url: this.props.sourceurl,
      pronect_url: this.props.projecturl,
      issues_url: this.props.issuesurl
    }
  },

  install: function () {
    this.installDependencies();
  }
});
