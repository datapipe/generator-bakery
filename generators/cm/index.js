'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  github = require('../../lib/github'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm:index'),
  glob = require('glob'),
  path = require('path'),
  _ = require('lodash');

const LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3', 'MIT', 'ISC'],
  CM_TOOLS = ['chef', 'puppet', 'bash'],
  CHEF_FILELIST = [
    'recipes/default.rb',
    'spec/unit/recipes/default_spec.rb',
    'spec/spec_helper.rb',
    'test/recipes/default_spec.rb',
    '.gitignore',
    '.kitchen.yml',
    'Berksfile',
    'chefignore',
    'Gemfile',
    'metadata.rb',
    'packer_variables.json',
    'README.md'
  ],
  PUPPET_FILELIST = [
    'hiera/hiera.yml',
    'manifests/default.pp',
    'modules/README.md',
    'spec/classes/init_spec.rb',
    'spec/spec_helper.rb',
    '.fixtures.yml',
    '.gitignore',
    'Gemfile',
    'hiera.yaml',
    'metadata.json',
    'Rakefile',
    'README.md'
  ];

var BakeryCM = yeoman.Base.extend({

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
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation'
    });

    var gitUser = github.getGitUser();
    this.user = gitUser || {};
  },

  prompting: function() {
    this.log(bakery.banner('Configuration Management!'));
    var userInfo = github.getGitUser() || {};
    var prompts = [{
      type: 'list',
      name: 'license',
      message: 'Choose a license to apply to the new project:',
      choices: LICENSES,
      required: true
    }, {
      type: "list",
      name: "cmtool",
      message: "Configuration Management (CM) tool:",
      choices: CM_TOOLS,
      required: true
    }, {
      type: 'input',
      name: 'authorname',
      message: "Enter the author's full name or organization:",
      default: userInfo.name,
      required: true
    }, {
      type: 'input',
      name: 'authoremail',
      message: "Enter the author or organization's email:",
      default: userInfo.email
    }, {
      type: 'input',
      name: 'shortdescription',
      message: 'Enter a short description of the project:',
      required: true
    }, {
      type: 'input',
      name: 'longdescription',
      message: 'Enter a long description of the project:',
      required: true
    }, {
      type: 'input',
      name: 'issuesurl',
      message: 'Enter the issues URL:',
      required: true
    }, {
      type: 'input',
      name: 'sourceurl',
      message: 'Enter the source URL:',
      required: true
    }, {
      type: 'input',
      name: 'initialversion',
      message: 'Initial version for package:',
      default: '0.1.0'
    }, {
      type: 'input',
      name: 'projecturl',
      message: 'Enter the project URL for this module:',
      when: function(response) {
        return response.cmtool == 'puppet';
      },
      required: function(response) {
        return response.cmtool == 'puppet';
      }
    }];

    return this.prompt(prompts).then(function(props) {
      // To access props later use this.props.someAnswer;
      this.answers = props;

      // load to global to share with other components easily
      process.env.CM_TYPE = this.answers.cmtool;
    }.bind(this));
  },

  default: {
    /*saveConfig: function() {
      _.forOwn(this.answers, function(value, key) {
        this.config.set(key, value);
      })
    }*/
  },

  writing: function() {
    var replacements = {
      license: this.answers.license,
      project_name: process.env.PROJECTNAME,
      author_name: this.answers.authorname,
      author_email: this.answers.authoremail,
      short_description: this.answers.shortdescription,
      long_description: this.answers.longdescription,
      source_url: this.answers.sourceurl,
      pronect_url: this.answers.projecturl,
      issues_url: this.answers.issuesurl,
      version: this.answers.initialversion,
      year: new Date().getFullYear()
    };


    var fileList = [];
    switch (process.env.CM_TYPE) {
      case 'puppet':
        this.sourceRoot(__dirname + '/templates/puppet');
        fileList = PUPPET_FILELIST;
        break;
      case 'chef':
        this.sourceRoot(__dirname + '/templates/chef');
        fileList = CHEF_FILELIST;
        break;
      default:
        feedback.warn('CM tool ' + process.env.CM_TYPE + ' is not yet implemented. Ignoring CM setup');
        break;
    };
    _.forEach(fileList, function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        replacements
      );
    }.bind(this));
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCM;
