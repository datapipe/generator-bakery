'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const SCM_TOOLS = ['github', 'github-enterprise'];

var ImageBuildCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.option('projectname', {
      desc: 'Name of the project being created',
      type: String,
      alias: 'n'
    });
  },

  prompting: function () {

    this.log(yosay(
      '... Configuration Management Details!'
    ));

    var prompts = [
      {
        type: "confirm",
        name: "createscm",
        message: "Attempt to create Source Control repository?",
        default: true
      },
      {
        type: "list",
        name: "scmtool",
        message: "Source Control Management (SCM) tool:",
        choices: SCM_TOOLS,
        when: function(response) {
          return response.create_scm;
        }
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      switch (this.props.scmtool){
        case 'github':
        case 'github-enterprise':
          this.composeWith('github-create:authenticate', {}, {});
          this.composeWith('github-create:create', {
            options: {
              name: this.options.projectname
            }}, {});
          break;
        default:
          this.log.error('SCM toolset ' + this.options.scmtool + ' is not currently available. Skipping SCM script setup');
          break;}
    }.bind(this));
  },

  writing: function () {
  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = ImageBuildCI;
