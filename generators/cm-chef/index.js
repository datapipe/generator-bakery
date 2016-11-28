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
    'README.md',
    'with_zero.rb',
    'install_cookbooks.sh'
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
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-chef') return;

    let gen_defaults = {
      'cm-chef': {
      }
    }

    this.config.defaults(gen_defaults);
  },

  writing: function() {
    /*
      TAKE NOTE: these next two lines are fallout of having to include ALL
        sub-generators in .composeWith(...) at the top level. Essentially
        ALL SUBGENERATORS RUN ALL THE TIME. So we have to escape from
        generators we don't want running within EVERY lifecycle method.

      (ugh)
    */
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-chef') return;

    var replacements = {
      license: cmInfo.license,
      project_name: this.config.get('bake').projectname,
      author_name: cmInfo.authorname,
      author_email: cmInfo.authoremail,
      short_description: cmInfo.shortdescription,
      long_description: cmInfo.longdescription,
      source_url: cmInfo.sourceurl,
      project_url: cmInfo.projecturl,
      issues_url: cmInfo.issuesurl,
      version: cmInfo.initialversion,
      year: new Date().getFullYear()
    };

    var fileList = [];
    this.sourceRoot(__dirname + '/templates');

    var packer_options = {
    };

    var provisioner_json = this.fs.readJSON(this.templatePath('chef_provisioner.json'));
    // var execute_command = 'cd /opt/chef/cookbooks/cookbooks-0 && sudo chef-client -z -o ' + packer_options.run_list + ' -c ../solo.rb';
    // we're going to default to a specific runlist for now.
    var execute_command = 'cd /opt/chef/cookbooks/cookbooks-0 && sudo chef-client -z -o recipe[onerun::default] -c ../solo.rb';
    provisioner_json.provisioners[0].execute_command = execute_command
    this.fs.extendJSON(this.destinationPath('packer.json'), provisioner_json);

    _.forEach(FILELIST, function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        replacements
      );
    }.bind(this));
  },

  install: function() {
    /*
      TAKE NOTE: these next two lines are fallout of having to include ALL
        sub-generators in .composeWith(...) at the top level. Essentially
        ALL SUBGENERATORS RUN ALL THE TIME. So we have to escape from
        generators we don't want running within EVERY lifecycle method.

      (ugh)
    */
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-chef') return;

    this.spawnCommand('./install_cookbooks.sh');
  }
});

module.exports = BakeryCM;