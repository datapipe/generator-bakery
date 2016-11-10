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
      projectname: this.projectname
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
    }];

    return this.prompt(prompts).then(function(props) {
      this.config.set('projectname', props.projectname || this.config.get('projectname'));
      this.config.save();

      let projectname = this.config.get('projectname');
      let args = { arguments: [ projectname ] };
      this.composeWith('bakery:cm', args);
      this.composeWith('bakery:scm');
      this.composeWith('bakery:ci');

      args.options = { awsprofile: this.options.awsprofile };
      this.composeWith('bakery:bake', args);
    }.bind(this));
  },

  writing: function() {},

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
