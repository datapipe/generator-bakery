'use strict';
var yeoman = require('yeoman-generator'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm:index');

var LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3',
    'MIT', 'ISC'
  ],

  CM_TOOL_CHEF = 'Chef Zero',
  CM_TOOL_PUPPET = 'Masterless Puppet',
  CM_TOOL_POWERSHELL = 'Powershell (Windows Only)',
  CM_TOOL_BASH = 'BASH (Linux Only)',
  CM_TOOLS = [CM_TOOL_CHEF, CM_TOOL_PUPPET, CM_TOOL_POWERSHELL, CM_TOOL_BASH],

  CM_GEN_CHEF = 'cm-chef',
  CM_GEN_PUPPET = 'cm-puppet',
  CM_GEN_POWERSHELL = 'cm-powershell',
  CM_GEN_BASH = 'cm-bash',
  CM_GENS = [CM_GEN_CHEF, CM_GEN_PUPPET, CM_GEN_POWERSHELL, CM_GEN_BASH];
/*
  Collects the high-level config needed by any of the CM payload implementations.
*/
var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';
  },

  initializing: function() {
    // establish some defaults
    let gen_defaults = {
      cm: {
        tool: CM_TOOL_CHEF,
        generatorName: CM_GEN_CHEF,
        license: LICENSES[0],
        cmtool: CM_TOOLS[0],
        initialversion: '0.1.0'
      }
    };

    this.config.defaults(gen_defaults);
  },

  prompting: function() {
    this.log(bakery.banner('Configuration Management!'));
    var cmInfo = this.config.get('cm');
    var prompts = [{
      name: 'tool',
      type: 'list',
      choices: CM_TOOLS,
      message: 'Choose configuration managment project type',
      default: cmInfo.tool,
      required: true
    }, {
      type: 'list',
      name: 'license',
      message: 'Choose a license to apply to the new project:',
      choices: LICENSES,
      required: true,
      default: cmInfo.license
    }, {
      type: 'input',
      name: 'authorname',
      message: 'Enter the author\'s full name or organization:',
      default: cmInfo.authorname,
      required: true
    }, {
      type: 'input',
      name: 'authoremail',
      message: 'Enter the author or organization\'s email:',
      default: cmInfo.authoremail
    }, {
      type: 'input',
      name: 'shortdescription',
      message: 'Enter a short description of the project:',
      required: true,
      default: cmInfo.shortdescription
    }, {
      type: 'input',
      name: 'longdescription',
      message: 'Enter a long description of the project:',
      required: true,
      default: cmInfo.longdescription
    }, {
      type: 'input',
      name: 'issuesurl',
      message: 'Enter the issues URL:',
      required: true,
      default: cmInfo.issuesurl
    }, {
      type: 'input',
      name: 'sourceurl',
      message: 'Enter the source URL:',
      required: true,
      default: cmInfo.sourceurl
    }, {
      type: 'input',
      name: 'initialversion',
      message: 'Initial version for package:',
      default: cmInfo.initialversion
    }];

    return this.prompt(prompts).then(function(props) {
      // push new property values into config
      let cmInfo = {
        tool: props.tool,
        license: props.license,
        authorname: props.authorname,
        authoremail: props.authoremail,
        shortdescription: props.shortdescription,
        longdescription: props.longdescription,
        sourceurl: props.sourceurl,
        issuesurl: props.issuesurl,
        initialversion: props.initialversion
      };

      switch (cmInfo.tool) {
        case CM_TOOL_CHEF:
          cmInfo.generatorName = CM_GEN_CHEF;
          break;
        case CM_TOOL_PUPPET:
          cmInfo.generatorName = CM_GEN_PUPPET;
          break;
        case CM_TOOL_POWERSHELL:
          cmInfo.generatorName = CM_GEN_POWERSHELL;
          break;
        case CM_TOOL_BASH:
          cmInfo.generatorName = CM_GEN_BASH;
          break;
      }

      this.config.set('cm', cmInfo);
      this.config.save();
    }.bind(this));
  },

});

module.exports = BakeryCM;
