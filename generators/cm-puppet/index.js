'use strict';
var yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm:index'),
  glob = require('glob'),
  path = require('path'),
  _ = require('lodash');

const FILELIST = [
  'manifests/site.pp',
  'modules/README.md',
  'spec/classes/init_spec.rb',
  'spec/spec_helper.rb',
  '.fixtures.yml',
  '.gitignore',
  'Gemfile',
  'hiera.yaml',
  'metadata.json',
  'Rakefile',
  'README.md',
  'install_modules.sh',
  'Puppetfile'
];

var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    this.argument('projectname', {
      type: String,
      required: this.config.get('projectname') == undefined
    });

  },

  initializing: function() {
    let gen_defaults = {
      'cm-puppet': {}
    };

    this.config.defaults(gen_defaults);
  },

  prompting: function() {
    /*
      TAKE NOTE: these next two lines are fallout of having to include ALL
        sub-generators in .composeWith(...) at the top level. Essentially
        ALL SUBGENERATORS RUN ALL THE TIME. So we have to escape from
        generators we don't want running within EVERY lifecycle method.

      (ugh)
    */
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-puppet') {
      return;
    }

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
    /*
      TAKE NOTE: these next two lines are fallout of having to include ALL
        sub-generators in .composeWith(...) at the top level. Essentially
        ALL SUBGENERATORS RUN ALL THE TIME. So we have to escape from
        generators we don't want running within EVERY lifecycle method.

      (ugh)
    */
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-puppet') {
      return;
    }

    let puppetInfo = this.config.get('cm-puppet');
    var replacements = {
      license: cmInfo.license,
      project_name: this.config.get('projectname'),
      author_name: cmInfo.authorname,
      author_email: cmInfo.authoremail,
      short_description: cmInfo.shortdescription,
      long_description: cmInfo.longdescription,
      source_url: cmInfo.sourceurl,
      project_url: puppetInfo.projecturl,
      issues_url: cmInfo.issuesurl,
      version: cmInfo.initialversion,
      year: new Date().getFullYear()
    };

    this.sourceRoot(__dirname + '/templates');

    var packer_options = {};

    var provisioner_json = this.fs.readJSON(this.templatePath(
      'puppet_provisioner.json'));

    this.fs.extendJSON('packer.json',
      provisioner_json);

    _.forEach(FILELIST, function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        replacements
      );
    }.bind(this));
  },

  end: function() {
    hasbin('packer', function(result) {
      if (result === false) {
        this.log(
          'Puppet is not installed locally. If you are going to test locally, please go to the link below for installation information.'
        );
        this.log(
          'Installation URL: https://docs.puppet.com/puppet/4.8/reference/install_pre.html'
        )
      }
    });
    hasbin('librarian-puppet', function(result) {
      if (result === false) {
        this.log(
          'Librarian-puppet is not installed locally. If you are going to test locally, please go to the link below for installation information.'
        );
        this.log(
          'Installation URL: https://github.com/rodjek/librarian-puppet'
        )
      }
    });
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
    if (cmInfo.generatorName != 'cm-puppet') {
      return;
    }

    this.spawnCommand('./install_modules.sh');
  }
});

module.exports = BakeryCM;
