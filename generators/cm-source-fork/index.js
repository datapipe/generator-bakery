'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  github = require('../../lib/github'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm-source-fork:index');


var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    var gitUser = github.getGitUser();
    this.user = gitUser || {};
  },

  initializing: function() {
    var userInfo = github.getGitUser() || {};
    let gen_defaults = {
      'cm-source-fork': {
        type: SCM_TOOLS_GITHUB,
        hostname: 'github.com'
      }
    }

    this.config.defaults(gen_defaults);
    console.log(this.config.getAll());
  },

  prompting: function() {
    this.log(bakery.banner('Configure SCM Source!'));
    var cmInfo = this.config.get('cm-source-fork');
    var prompts = [{
      type: 'list',
      name: 'type',
      message: 'Choose SCM type for configuration management template:',
      choices: SCM_TOOLS,
      required: true,
      default: cmInfo.type
    }, {
      type: "input",
      name: "hostname",
      message: "Enter SCM hostname:",
      required: true,
      default: cmInfo.hostname
    }, {
      type: 'input',
      name: 'organization',
      message: "Organiztion containing repository:",
      required: true,
      default: cmInfo.organization
    }, {
      type: 'input',
      name: 'repositoryname',
      message: "Name of repository:",
      default: cmInfo.repository
    }, {
      type: 'input',
      name: 'oauthToken',
      message: 'OAuth token:',
      required: true,
      default: cmInfo.oauthToken
    }];

    return this.prompt(prompts).then(function(props) {
      let fork_config = {
        type: props.type,
        hostname: props.hostname,
        organization: props.organization,
        respository: props.repository,
        oauthToken: props.oauthToken
      };

      this.config.set('cm-source-fork', fork_config);
      this.config.save();

    }.bind(this));
  },

  writing: function() {
    console.log('source from fork not implemented yet');
  }

});

module.exports = BakeryCM;
