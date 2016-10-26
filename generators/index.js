'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const CM_TOOLS = ['chef', 'puppet', 'bash'];

var ImageBuildGenerator = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('generator-imagebuild') + ' generator!'
    ));

    var prompts = [
    {
      type: "input",
      name: "projectname",
      message: "Enter a name for your image."
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;

      this.composeWith('imagebuild:scm', {
        options: {
          projectname: this.props.projectname
        }}, {});

      this.composeWith('imagebuild:cm', {
        options: {
          projectname: this.props.projectname
        }}, {});

      this.composeWith('imagebuild:bake', {
        options: {
          projectname: this.props.projectname
        }}, {}) ;

      this.composeWith('imagebuild:ci', {
      options: {
        projectname: this.props.projectname
      }}, {})
    }.bind(this));
  },

  writing: function () {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = ImageBuildGenerator;
