'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../lib/bakery'),
  feedback = require('../lib/feedback'),
  debug = require('debug')('bakery:generator:index'),
  mkdirp = require('mkdirp'),
  path = require('path'),
  _ = require('lodash');

const CM_TOOL_CHEF = 'chef';
const CM_TOOL_PUPPET = 'puppet';
const CM_TOOL_BASH = 'bash';
const CM_TOOLS = [ CM_TOOL_CHEF, CM_TOOL_PUPPET, CM_TOOL_BASH ];

const CM_SOURCE_DIRECTORY = 'directory';
const CM_SOURCE_FORK = 'fork';
const CM_SOURCE_GENERATE = 'generate'
const CM_SOURCES = [ CM_SOURCE_DIRECTORY, CM_SOURCE_FORK, CM_SOURCE_GENERATE ];

var BakeryGenerator = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};
    this.existingProject = false;

    this.argument('projectname', {
      type: String,
      required: false
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation'
    });
  },

  initializing: function() {
    let default_config = {
      cm: {
        type: CM_TOOL_BASH,
        source: CM_SOURCE_DIRECTORY
      }
    }
    this.config.defaults(default_config);

/*
    loadConfig: function() {
      var configFound = this.baseName !== undefined && this.applicationType !== undefined;
      if (configFound) {
        this.existingProject = true;
      }
    }
 */
  },

  default: {
    function() {
      if (path.basename(this.destinationPath()) !== this.projectname) {
        mkdirp(this.projectname);
        this.destinationRoot(this.destinationPath(this.projectname));
      }
    },
  },

  prompting: function() {
    process.env.AWS_PROFILE = this.options.awsprofile || 'default';
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') + ' generator!'
    ));

    let cm = this.config.get('cm');

    var prompts = [{
      name: "projectname",
      type: "input",
      message: "Project name",
      when: function() { this.projectname == undefined },
      default: this.config.get('projectname')
    },{
      name: "type",
      type: "list",
      choices: CM_TOOLS,
      message: "Choose a configuration managment tool",
      default: cm.type
    },
    {
      name: "source",
      type: "list",
      choices: CM_SOURCES,
      message: "Choose a source configuration management template",
      default: cm.source
    }];

    return this.prompt(prompts).then(function(props) {
      let bake_conf = {
        projectname: props.projectname,
        type: props.type,
        source: props.source
      };
      this.config.set('bake', bake_conf);
      this.config.save();

      let args = { arguments: [props.projectname || this.projectname]};

      switch(props.source) {
        case CM_SOURCE_DIRECTORY:
          this.composeWith('bakery:cm', args, {});
          break;
        case CM_SOURCE_FORK:
          this.composeWith('bakery:cm-source-fork');
          break;
        case CM_SOURCE_GENERATE:
          this.composeWith('bakery:cm-source-generate');
          break;
      }
      this.composeWith('bakery:scm', args, {});
      this.composeWith('bakery:ci', args, {});
      this.composeWith('bakery:bake', args, {});
    }.bind(this));
  },

  writing: function() {},

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
