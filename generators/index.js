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
const CM_SOURCES = [  CM_SOURCE_GENERATE, CM_SOURCE_DIRECTORY, CM_SOURCE_FORK ];

var BakeryGenerator = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};
    this.existingProject = false;

    this.argument('projectname', {
      type: String,
      required: false,
      defaults: ''
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation',
      defaults: 'default'
    });
  },

  initializing: function() {
    let default_config = {
      source: CM_SOURCE_DIRECTORY,
      projectname: this.projectname
    }
    this.config.defaults(default_config);

    var configFound = this.baseName !== undefined && this.applicationType !== undefined;
    if (configFound) {
      this.existingProject = true;
    }
  },

<<<<<<< HEAD
=======
  default: {
    function() {
    },
  },

>>>>>>> cf5cf57... fix projectname argument handling
  prompting: function() {
    process.env.AWS_PROFILE = this.options.awsprofile;
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') + ' generator!'
    ));

    let prompts = [{
      name: "projectname",
      type: "input",
      message: "Project name",
      when: () => { return (this.projectname.length < 1); },
      default: this.config.get('projectname'),
      required: true
    },
    {
      name: "source",
      type: "list",
      choices: CM_SOURCES,
      message: "Choose source of configuration management code",
      default: this.config.get('source'),
      required: true
    }];

    return this.prompt(prompts).then(function(props) {
      this.config.set('projectname', props.projectname || this.config.get('projectname'));
      this.config.set('source', props.source);
      this.config.save();

      let projectname = this.config.get('projectname');
      let args = { arguments: [ projectname ] };

      switch(props.source) {
        case CM_SOURCE_GENERATE:
          this.composeWith('bakery:cm', args);
          break;
        case CM_SOURCE_FORK:
          this.composeWith('bakery:cm-fork');
          break;
        case CM_SOURCE_DIRECTORY:
          this.composeWith('bakery:cm-local');
          break;
      }
      this.composeWith('bakery:scm');
      this.composeWith('bakery:ci');

      args.options = { awsprofile: this.options.awsprofile };
      this.composeWith('bakery:bake', args);
    }.bind(this));
  },

  configuring: function() {
    let projectname = this.config.get('projectname');
    if (path.basename(this.destinationPath()) !== projectname) {
      mkdirp(projectname);
      this.destinationRoot(this.destinationPath(projectname));
    }
  },

  writing: function() {},

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
