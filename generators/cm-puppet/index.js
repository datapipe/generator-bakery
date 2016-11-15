'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm:index'),
  glob = require('glob'),
  path = require('path'),
  _ = require('lodash');

const FILELIST = [
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

    this.argument('projectname', {
      type: String,
      required: (this.config.get('projectname') == undefined)
    });

  },

  initializing: function() {
    let gen_defaults = {
      'cm-puppet': {
      }
    }

    this.config.defaults(gen_defaults);
  },

  prompting: function() {
    this.log(bakery.banner('Puppet CM Project'));
    var puppetInfo = this.config.get('cm-puppet');
    var prompts = [{
      type: 'input',
      name: 'projecturl',
      message: 'Enter the project URL for this module:',
      default: puppetInfo.projecturl
    }];

    return this.prompt(prompts).then(function(props) {
      let gen_config = {
        projecturl: props.projecturl
      };
      this.config.set('cm-puppet', gen_config);
      this.config.save();

    }.bind(this));
  },

  writing: function() {
    let cmInfo = this.config.get('cm');
    let puppetInfo = this.config.get('cm-puppet');
    var replacements = {
      license: cmInfo.license,
      project_name: this.config.get('bake').projectname,
      author_name: cmInfo.authorname,
      author_email: cmInfo.authoremail,
      short_description: cmInfo.shortdescription,
      long_description: cmInfo.longdescription,
      source_url: cmInfo.sourceurl,
      pronect_url: puppetInfo.projecturl,
      issues_url: cmInfo.issuesurl,
      version: cmInfo.initialversion,
      year: new Date().getFullYear()
    };

    this.sourceRoot(__dirname + '/templates');

    var packer_options = {
    };

    var provisioner_json = this.fs.readJSON(this.templatePath('puppet_provisioner.json'));

    // provisioner_json.provisioners[0].execute_command = ...
    this.fs.extendJSON(this.destinationPath('packer.json'), provisioner_json);

    _.forEach(FILELIST, function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        replacements
      );
    }.bind(this));
  },

});

module.exports = BakeryCM;
