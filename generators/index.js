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

const CM_SOURCE_DIRECTORY = 'Local Directory';
const CM_SOURCE_FORK = 'Fork From SCM';
const CM_SOURCE_GENERATE = 'Use Generator'
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
      bake: {
        source: CM_SOURCE_DIRECTORY
      }
    }
    this.config.defaults(default_config);

    var configFound = this.baseName !== undefined && this.applicationType !== undefined;
    if (configFound) {
      this.existingProject = true;
    }
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

    let cm = this.config.get('bake');

    let prompts = [{
      name: "projectname",
      type: "input",
      message: "Project name",
      when: function() { this.projectname == undefined },
      default: this.config.get('projectname')
    },
    {
      name: "source",
      type: "list",
      choices: CM_SOURCES,
      message: "Choose source of configuration management code",
      default: cm.source
    }];

    return this.prompt(prompts).then(function(props) {
      let bake_conf = {
        projectname: props.projectname,
        source: props.source
      };
      this.config.set('bake', bake_conf);
      this.config.save();

      let args = { arguments: [props.projectname || this.projectname]};

      switch(props.source) {
        case CM_SOURCE_GENERATE:
          this.composeWith('bakery:cm', args, {});
          break;
        case CM_SOURCE_FORK:
          this.composeWith('bakery:cm-source-fork');
          break;
        case CM_SOURCE_DIRECTORY:
          this.composeWith('bakery:cm-source-local');
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
