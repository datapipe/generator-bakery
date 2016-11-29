'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var hasbin = require('hasbin');

var BakeryGenerator = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this._options.help.desc = 'Show this help';

    this.existingProject = false;

    this.argument('projectname', {
      type: String,
      required: false,
      defaults: ''
    });

    /*
      Sets a working directory. The will be staged in [working dir]/[project name]. This prevents
      the CWD (ie. generator-bakery/) from being used as a working directory. If generator-bakery/
      is used the staging directory becomes a nested Git project causing all sorts of havoc.
    */
    this.option('workingdir', {
      type: String,
      alias: 'w',
      desc: 'Identifies a parent directory for the output of this generator',
      defaults: ''
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation',
      defaults: 'default'
    });
  },

  initializing: function() {
    // establish default
    let defaultConfig = {
      projectname: this.projectname
    };
    this.config.defaults(defaultConfig);

    // this seem vestigal - @pmmclory?
    var configFound = this.baseName !== undefined && this.applicationType !==
      undefined;
    if (configFound) {
      this.existingProject = true;
    }
  },

  prompting: function() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-excellent ' + chalk.red('bakery') +
      ' generator!'
    ));

    // If projectname is not supplied as an argument at the command line collect it here
    let prompts = [{
      name: 'projectname',
      type: 'input',
      message: 'Project name',
      when: () => {
        return this.projectname.length < 1;
      },
      // on first-run this uses value set in 'initializing'. Subsequently values are read
      //  from .yo.rc.json
      default: this.projectname || this.config.get(
        'projectname'),
      required: true
    }];

    return this.prompt(prompts).then(function(props) {
      /*
        we're using the Yeoman-native config system. This means all config gets stored in
        .yo.rc.json in the CWD. Values gathered from the top-level generator (this one) are
        stored in top-level keys in .yo.rc.json. Each sub-generator will store its properties
        in a key named after itself. For example bakery:scm will store its properties under
        the 'scm' key. THIS IS BY CONVENTION ONLY. The logic is implemented in each generator.
        If this is a pattern we like we ought probably to subclass the Yeoman Base class into
        a BakeryBase and code this convention as part of the framework.

        Note: config.set(...), config.get(...), and config.defaults(...) operate on top-level
         keys only. config will not do a deep merge when you set/get things. So beware the
         clobberage.
      */
      this.config.set('projectname', this.projectname || this.config
        .get('projectname'));
      this.config.set('source', props.source);

      /*
        the call to config.save does not appear to write to disk until sometime late in the
        generator lifecycle. Perhaps this is due to the in-memory fs Yeoman uses? Perhaps
        this is an async call? Regardless - exit/failure before the completion of the lifecycle
        tends to mean config is not saved.
      */
      this.config.save();

      let projectname = this.config.get('projectname');
      let args = {
        arguments: [projectname]
      };

      // Call all the sub-generators.
      this.composeWith('bakery:cm', args);
      /*
        'cm' branches to use a specific sub-sub-generator to deliver the project template.
        this.composeWith(...) queues generators and executes lifecycle stages serially. Thus
        all the sub-generators (and sub-sub-generators, and...) MUST be registerd/identified
        up front if we want them to run in the proper order.

        This is another candidate for pushing logic into a custom base class. A
        'registerSubGenerator(...)' method could allow calling back into each to make sure
        it's sub-sub-generators get queued in the proper order.

        The alternate is reverting to 'monolithic' generators which bake in all branching
        and implementation logic so as to eliminate 'sub-sub-generators'
      */
      this.composeWith('bakery:cm-chef', args);
      this.composeWith('bakery:cm-puppet', args);
      this.composeWith('bakery:cm-powershell', args);
      this.composeWith('bakery:cm-bash', args);
      this.composeWith('bakery:scm', args);
      this.composeWith('bakery:ci', args);

      // bake requires the awsprofile name which was passed as a command line arg.
      args.options = {
        awsprofile: this.options.awsprofile
      };
      this.composeWith('bakery:bake', args);
    }.bind(this));
  },

  configuring: function() {
    // set up the project's working directory
    let tmpProjectName = this.projectname || this.config.get(
      'projectname');
    if (!this.destinationRoot().includes(tmpProjectName)) {
      let projPath = path.join(this.options.workingdir || this.destinationRoot(),
        tmpProjectName);
      this.destinationRoot(projPath);
    }
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryGenerator;
