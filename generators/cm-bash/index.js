'use strict';
var yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:cm-bash:index'),
  glob = require('glob'),
  path = require('path'),
  _ = require('lodash');

// placeholder for CM implementaiton delivering a BASH-based project.
var BakeryCM = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    this.argument('projectname', {
      type: String,
      required: this.config.get('projectname') == undefined
    });
  },

  // generators are invalid without at least one method to run during lifecycle
  default: function () {
    /*
      TAKE NOTE: these next two lines are fallout of having to include ALL
        sub-generators in .composeWith(...) at the top level. Essentially
        ALL SUBGENERATORS RUN ALL THE TIME. So we have to escape from
        generators we don't want running within EVERY lifecycle method.

      (ugh)
    */
    let cmInfo = this.config.get('cm');
    if (cmInfo.generatorName != 'cm-bash') {
      return;
    }
  }
});

module.exports = BakeryCM;
