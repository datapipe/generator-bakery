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

const CM_TOOLS = ['chef', 'puppet', 'bash'];

var BakeryGenerator = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};
    this.existingProject = false;

    this.argument('projectname', {
      type: String,
      required: function() {
        return this.projectname != Undefined;
      }
    });
    
    this.option('awsProfile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation'
    });
  },

  initializing: {
    loadConfig: function() {
      this.projectname = this.config.get('projectname');
      var configFound = this.baseName !== undefined && this.applicationType !== undefined;
      if (configFound) {
        this.existingProject = true;
      }
    }
  },

  default: {
    function() {
      if (path.basename(this.destinationPath()) !== this.projectname) {
        mkdirp(this.projectname);
        this.destinationRoot(this.destinationPath(this.projectname));
      }
    },

    saveConfig: function() {
      this.config.set('projectname', this.projectname);
      this.config.saveConfig()
    },
  },

  prompting: function() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') + ' generator!'
    ));

    var prompts = [];

    return this.prompt(prompts).then(function(props) {
      this.props = props;
      process.env.PROJECTNAME = this.projectname;
      this.composeWith('bakery:scm', {
        arguments: [process.env.PROJECTNAME],
        options: ['awsProfile': this.options.awsProfile]
      }, {});
      this.composeWith('bakery:cm', {
        arguments: [process.env.PROJECTNAME],
        options: ['awsProfile': this.options.awsProfile]
      }, {});
      this.composeWith('bakery:ci', {
        arguments: [process.env.PROJECTNAME],
        options: ['awsProfile': this.options.awsProfile]
      }, {});
      this.composeWith('bakery:bake', {
        arguments: [process.env.PROJECTNAME],
        options: ['awsProfile': this.options.awsProfile]
      }, {});
    }.bind(this));
  },

  writing: function() {},

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
