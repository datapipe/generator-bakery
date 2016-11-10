'use strict';
const yeoman = require('yeoman-generator'),
  bakery = require('../../lib/bakery'),
  debug = require('debug')('bakery:generators:cm-local:index'),
  feedback = require('../../lib/feedback'),
  fs = require('fs-extra'),
  github = require('../../lib/github');

const CM_TYPE_BASH = 'BASH';
const CM_TYPE_CHEF = 'Chef';
const CM_TYPE_POWERSHELL = 'Powershell';
const CM_TYPE_PUPPET = 'Puppet';
const CM_TYPES = [  CM_TYPE_BASH, CM_TYPE_CHEF, CM_TYPE_POWERSHELL, CM_TYPE_PUPPET ];

var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';
  },

  initializing: function() {
    let cmInfo = {
      'cm-local': {
        type: CM_TYPE_CHEF
      }
    }
    this.config.set('cm-local', cmInfo);
    this.config.save();
  },

  prompting: function() {
    this.log(bakery.banner('Configure Local Source!'));
    var cmInfo = this.config.get('cm-local');
    var prompts = [{
      type: 'input',
      name: 'directory',
      message: 'Choose a local directory with your CM project content:',
      required: true,
      default: cmInfo.directory,
      validate: function(value) {
        if (!fs.existsSync(value) || !fs.statSync(value).isDirectory()) {
          feedback.warn("%s is not a directory", value);
          return false;
        }
        return true;
      }
    }, {
      type: "list",
      name: "type",
      message: "Enter project type contained in this directory:",
      choices: CM_TYPES,
      required: true,
      default: cmInfo.type
    }];

    return this.prompt(prompts).then(function(props) {
      let local_config = {
        directory: props.directory,
        type: props.type
      };

      this.config.set('cm-local', local_config);
      this.config.save();

    }.bind(this));
  }

});

module.exports = BakeryCM;
