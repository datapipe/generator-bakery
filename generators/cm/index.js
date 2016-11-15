'use strict';
const yeoman = require('yeoman-generator'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm:index');

const CM_TOOL_CHEF = 'Chef Zero',
      CM_TOOL_PUPPET = 'Masterless Puppet',
      CM_TOOL_POWERSHELL = 'Powershell (Windows Only)',
      CM_TOOL_BASH = 'BASH (Linux Only)',
      CM_TOOLS = [ CM_TOOL_CHEF, CM_TOOL_PUPPET, CM_TOOL_POWERSHELL, CM_TOOL_BASH ];

var BakeryCM = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';
  },

  initializing: function() {
    var userInfo = github.getGitUser() || {};
    let gen_defaults = {
      cm: {
        tool: CM_TOOL_CHEF,
        license: LICENSES[0],
        cmtool: CM_TOOLS[0],
        authorname: userInfo.name,
        authoremail: userInfo.email,
        initialversion: '0.1.0'
    }

    this.config.defaults(gen_defaults);
  },

  prompting: function() {
    this.log(bakery.banner('Configuration Management!'));
    var cmInfo = this.config.get('cm');
    var prompts = [,
    {
      name: "type",
      type: "list",
      choices: CM_TOOLS,
      message: "Choose configuration managment project type",
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
      message: "Enter the author's full name or organization:",
      default: cmInfo.authorname,
      required: true
    }, {
      type: 'input',
      name: 'authoremail',
      message: "Enter the author or organization's email:",
      default: cmInfo.authoremail
    }, {
      type: 'input',
      name: 'shortdescription',
      message: 'Enter a short description of the project:',
      required: true,
      default: cmInfo.shortdescripton
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
      default: cmInfo.issueurl
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
      let cmInfo = {
        type: props.type,
        license: props.license,
        authorname: cmInfo.authorname,
        authoremail: cmInfo.authoremail,
        shortdescription: cmInfo.shortdescription,
        longdescription: cmInfo.longdescription,
        sourceurl: cmInfo.sourceurl,
        issuesurl: cmInfo.issuesurl,
        initialversion: cmInfo.initialversion
      };

      this.config.set('cm', props.source);
      this.config.save();

      let projectname = this.config.get('projectname');
      let args = { arguments: [ projectname ] };

      switch(props.source) {
        case CM_TOOL_CHEF:
          this.composeWith('bakery:cm-chef', args);
          break;
        case CM_TOOL_PUPPET:
          this.composeWith('bakery:cm-puppet', args);
          break;
        case CM_TOOL_POWERSHELL:
          this.composeWith('bakery:cm-powershell', args);
          break;
        case CM_TOOL_BASH:
          this.composeWith('bakery:cm-bash', args);
          break;
      }
    }.bind(this));
  }
});

module.exports = BakeryCM;
