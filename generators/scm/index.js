'use strict';
const yeoman = require('yeoman-generator'),
       chalk = require('chalk'),
       yosay = require('yosay'),
      bakery = require('../../lib/bakery'),
      github = require('../../lib/github');

const SCM_TOOLS = ['github', 'github-enterprise'];

var BakeryCI = yeoman.Base.extend({

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

    this.log(bakery.banner('Project Setup!'));
    
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
          return response.createscm;
        }
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      switch (this.props.scmtool){
        case 'github':
        case 'github-enterprise':
          // need to implement this...
          this.log('Still need to implement this...');
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

module.exports = BakeryCI;
