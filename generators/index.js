'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const SCM_TOOLS = ['github', 'github-enterprise'];
const CM_TOOLS = ['chef', 'puppet', 'bash'];
const CI_TOOLS = ['jenkins', 'drone'];
const LICENSES = ['Proprietary - All Rights Reserved', 'Apache v2.0', 'GPL v3', 'MIT', 'ISC'];
const AWS_REGIONS = [{name: 'us-east-1'}, {name: 'us-east-2'}, {name: 'us-west-1'}, {name: 'us-west-2'}, {name: 'ap-south-1'}, {name: 'ap-northeast-1'}, {name: 'ap-southeast-1'}, {name: 'ap-southeast-2'}, {name: 'ap-northeast-1'}, {name: 'eu-central-1'}, {name: 'eu-west-1'}, {name: 'sa-east-1'}];
const AWS_INSTANCE_TYPES = ['t2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large', 'm4.large', 'm4.xlarge', 'm4.2xlarge', 'm4.4xlarge', 'm4.8xlarge', 'm4.16xlarge', 'c4.large', 'c4.xlarge', 'c4.2xlarge', 'c4.4xlarge', 'c4.8xlarge'];

var ImageBuildGenerator = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('generator-imagebuild') + ' generator!'
    ));

    var prompts = [
    {
      type: "input",
      name: "imagename",
      message: "Enter a name for your image."
    },
    {
      type: 'list',
      name: 'license',
      message: 'Choose a license to apply to the new project:',
      choices: LICENSES
    },
    {
      type: 'input',
      name: 'authorname',
      message: "Enter the author's full name or organization:"
    },
    {
        type: 'input',
        name: 'authoremail',
        message: "Enter the author or organization's email:"
    },
    {
        type: 'input',
        name: 'shortdescription',
        message: 'Enter a short description of the project'
    },
    {
        type: 'input',
        name: 'longdescription',
        message: 'Enter a long description of the project'
    },
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
    },
    {
      type: "list",
      name: "cmtool",
      message: "Configuration Management (CM) tool:",
      choices: CM_TOOLS
    },
    {
      type: "confirm",
      name: "createami",
      message: "Create Amazon Machine Image?",
      default: true
    },
    {
      type: "list",
      name: "awsregions",
      message: "Choose AWS Region(s) for creation",
      choices: AWS_REGIONS,
      when: function (response) {
        return response.createami;
      },
      default: 'us-west-2'
    },
    {
      type: "choice",
      name: "parallelorcopy",
      message: "Build in parallel or build and copy?",
      choices: ['parallel', 'copy'],
      when: function (response) {
        return (response.createami && response.awsregions.length() > 1);
      },
      default: 'copy'
    },
    {
      type: 'list',
      name: 'primaryregion',
      message: 'Choose a primary region for building in AWS:',
      when: function(response) {
        return (response.parallelorcopy == 'copy' && response.awsregions.length() > 1);
      },
      choices: function(response) {
        return response.awsregions;
      }
    },
    {
      type: 'list',
      name: 'buildimagetype',
      message: 'Instance Type for build:',
      default: 't2.large',
      when: function (response) {
        return response.createami;
      }
    },
    {
      type: 'input',
      name: 'regionSpecificAmi',
      message: 'Region-specific base AMI',
      when: function(response) {
        return response.createami && response.primaryregion;
      }
    },
    {
      type: "confirm",
      name: "createci",
      message: "Create CI Scripts?",
      default: true
    },
    {
      type: "list",
      name: "citool",
      message: "Continuous Integration (CI) tool:",
      choices: CI_TOOLS,
      when: function(response) {
        return response.create_ci;
      }
    }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;

      if (this.props.createscm) {
        this.composeWith('imagebuild:scm', {
          options: {
            scmtool: this.props.scmtool,
            projectname: this.props.imagename
          }}, {});
      }

      this.composeWith('imagebuild:cm', {
        options: {
          cmtool: this.props.cmtool,
          projectname: this.props.imagename
        }}, {});

      if (this.props.createci) {
        this.composeWith('imagebuild:ci', {
          options: {
            citool: this.props.citool,
            projectname: this.props.imagename
          }}, {})
      }
    }.bind(this));
  },

  writing: function () {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = ImageBuildGenerator;
