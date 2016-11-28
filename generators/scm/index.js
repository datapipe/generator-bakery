'use strict';
const yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  Github = require('../../lib/github').Github,
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:scm:index'),
  _ = require('lodash');

const SCM_TOOL_GITHUB = 'github';
const SCM_TOOLS = [ SCM_TOOL_GITHUB ];

var BakeryCI = yeoman.Base.extend({

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    this.argument('projectname', {
      type: String,
      required: (this.config.get('projectname') == undefined)
    });

    // allow credentials to be set as env variables so they do not need
    // to be copy/pasted each run
    this.gittoken = process.env.GIT_TOKEN;
  },

  initializing: function() {
    let default_config = {
      scm: {
        active: true,
        scmtool: SCM_TOOL_GITHUB,
        scmhost: 'github.com',
        // repo should use projectname by default
        repository: this.projectname
      }
    }
    this.config.defaults(default_config);
  },

  prompting: function() {
    this.log(bakery.banner('Source Control Setup!'));

    let scmInfo = this.config.get('scm');
    let _org;

    var prompts = [
    {
      type: 'confirm',
      name: 'createscm',
      message: 'Attempt to create Source Control repository?',
      default: scmInfo.active
    }, {
      type: 'list',
      name: 'scmtool',
      message: 'Source Control Management (SCM) tool:',
      choices: SCM_TOOLS,
      when: function(response) {
        return response.createscm;
      },
      default: scmInfo.scmtool
    }, {
      type: 'input',
      name: 'gittoken',
      message: 'Github OAuth token (this will NOT be saved - set env. var. GIT_TOKEN to skip):',
      when: response => {
        return (response.createscm && !this.gittoken);
      },
      required: true,
      // no hook is provided for processing prompts individual - hijacking validate(...)
      //  to store gittoken for use in later prompts
      validate: token => {
        this.gittoken = token;
        return true;
      }
    }, {
      type: 'input',
      name: 'scmhost',
      message: 'Source Control Management hostname:',
      when: function(response) {
        return response.createscm;
      },
      default: scmInfo.scmhost,
      validate: host => {
        let credentials = {
          type: 'accessToken',
          accessToken: this.gittoken
        }
        this.github = new Github(host, credentials);
        return this.github.getUserInfo().then(
          userInfo => {
            feedback.info('confirmed authentication for ' + userInfo.login);
            return true;
          },
          err => {
            feedback.warn('could not authenticate to ' + host + ': ' + err.message);
            return false;
          }
        )
      }
    }, {
      type: 'list',
      name: 'organization',
      message: 'Select which organization should own the repository:',
      choices: () => {
        // obtain the list of organizations this user has access to
        return this.github.getOrganizations()
          .then(orgs => {
            let choices = [];
            orgs.forEach( org => {
              choices.push(org.login);
            });
            return Promise.resolve(choices);
          });
      },
      when: function(response) {
        return response.createscm;
      },
      default: scmInfo.organization
    }];

    // props.organization is needed in order to validate the repository (ie. check if it
    //  already exists). This is the alternate pattern to hijacking 'validate(...' as done
    //  for 'gittoken' input above.
    return this.prompt(prompts).then(props => {
      return props;
    }).then(props => {
      let repoPrompt = [{
        type: 'input',
        name: 'repository',
        message: 'Repository name:',
        when: responses => {
          return props.createscm;
        },
        default: scmInfo.repository,
        validate: repo => {
          // check if the repo already exists
          return this.github.getRepoInfo(props.organization, repo)
            .then(
              result => {
                if (result != null && result.name == repo){
                  feedback.warn('Repository %s already exists for organization %s', repo, props.organization);
                  return Promise.resolve(false);
                }
                return Promise.resolve(true);
              },
              err => {
                feedback.warn('could not validate repo: ' + err.message);
                return Promise.resolve(false);
              });
        }
      }];

      return this.prompt(repoPrompt).then(newProps => {
        // write config
        let scmInfo = {
          active: props.createscm,
          scmtool: props.scmtool,
          scmhost: props.scmhost,
          organization: props.organization,
          repository: newProps.repository
        }
        this.config.set('scm', scmInfo);
        this.config.save();

        // made a judgement call not to write credentials to .yo.rc.json
        if (props.gittoken) {
          this.gittoken = props.gittoken;
        }
      });
    });
  },

  writing: function() {

    /*
      This gets down to business and creates the repo for the project. This creates the remote repo, then
      does all the work locally to prep the local project staging directory for push (ie. inits the repo,
      adds the remote repo as the 'origin', adds all the files, then commits all the added files).
      Finally it pushes the local staging directory to the remote repo.
    */
    let scmInfo = this.config.get('scm');
    let cmInfo = this.config.get('cm');
    let cmImplInfo = this.config.get(cmInfo.generatorName);

    switch (scmInfo.scmtool) {
      case SCM_TOOL_GITHUB:
        // create https://[hostname]/[organization]/[repository] Git repo
        this.github.createOrgRepository(scmInfo.organization, scmInfo.repository, cmInfo.shortdescription)
          .then(repo => {
              // init local repo
              return this.github.init(this.destinationRoot());
            },
            err => {
              // if the repository could not be created STOP. This will run INSTEAD of
              //  the repo => {} callback above in the event of error
              feedback.warn('Could not create repository: ' + err.message);
              process.exit(1);
            })
          .then(() => {
            // set the remote repo as the 'origin' for the local staging repo
            let url = [
                        'https://' + scmInfo.scmhost,
                        scmInfo.organization,
                        scmInfo.repository
                      ].join('/');
            return this.github.setOrigin(this.destinationRoot(), url);
          })
          .then(repo => {
            // add all the things!
            return this.github.add(this.destinationRoot(),
                                   cmInfo.authorname,
                                   cmInfo.authoremail,
                                   'created by generator-bakery');
          })
          .then(() => {
            // push eveyrthing to the repo
            return this.github.push(this.destinationRoot());
          });
        // need to implement this...
        break;
      default:
        if (typeof scmInfo.scmtool != 'undefined') {
          feedback.warn('SCM toolset ' + scmInfo.scmtool + ' is not currently available. Skipping SCM script setup');
        }
        break;
    }
  },

  default: {
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryCI;
