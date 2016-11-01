'use strict';
const yeoman = require('yeoman-generator'),
       chalk = require('chalk'),
       yosay = require('yosay'),
      bakery = require('../lib/bakery'),
    feedback = require('../lib/feedback'),
       debug = require('debug')('bakery:lib:github'),
           _ = require('lodash');

const CM_TOOLS = ['chef', 'puppet', 'bash'];

var BakeryGenerator = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.argument('projectname', {type: String, required: true});
  },

  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') + ' generator!'
    ));

    var prompts = [];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      process.env.PROJECTNAME = this.projectname;

      this.composeWith('bakery:scm', { arguments: [process.env.PROJECTNAME] }, {});

      this.composeWith('bakery:cm', { arguments: [process.env.PROJECTNAME] }, {});

      this.composeWith('bakery:ci', { arguments: [process.env.PROJECTNAME] }, {});

      this.composeWith('bakery:bake', { arguments: [process.env.PROJECTNAME] }, {});
    }.bind(this));
  },

  writing: function () {
    this.destinationRoot(process.env.PROJECTNAME + '/');
  },

  install: function () {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
