'use strict';
const yeoman = require('yeoman-generator'),
       chalk = require('chalk'),
       yosay = require('yosay'),
      bakery = require('../lib/bakery'),
    feedback = require('../../lib/feedback'),
       debug = require('debug')('bakery:lib:github'),
           _ = require('lodash');

const CM_TOOLS = ['chef', 'puppet', 'bash'];

var BakeryGenerator = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') + ' generator!'
    ));

    var prompts = [
    {
      type: "input",
      name: "projectname",
      message: "Enter a name for your image."
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      process.env.PROJECTNAME = this.props.projectname;

      this.composeWith('bakery:scm', {
        options: {
          projectname: this.props.projectname
        }}, {});

      this.composeWith('bakery:cm', {
        options: {
          projectname: this.props.projectname
        }}, {});

      this.composeWith('bakery:ci', {
      options: {
        projectname: this.props.projectname
      }}, {});

      this.composeWith('bakery:bake', {
        options: {
          projectname: this.props.projectname
        }}, {}) ;
    }.bind(this));
  },

  writing: function () {

  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
