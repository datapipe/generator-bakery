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

    this.gittoken = process.env.GIT_TOKEN;
    feedback.info(this.gittoken);
  },

  initializing: function() {
    let default_config = {
      scm: {
        active: true,
        scmtool: SCM_TOOL_GITHUB,
        scmhost: 'github.com'
      }
    }
    this.config.defaults(default_config);
  },

  prompting: function() {
    this.log(bakery.banner('Project Setup!'));

    let scmInfo = this.config.get('scm');
    let _org;

    var prompts = [
    {
      type: "confirm",
      name: "createscm",
      message: "Attempt to create Source Control repository?",
      default: scmInfo.active
    }, {
      type: "list",
      name: "scmtool",
      message: "Source Control Management (SCM) tool:",
      choices: SCM_TOOLS,
      when: function(response) {
        return response.createscm;
      },
      default: scmInfo.scmtool
    }, {
      type: "input",
      name: "gittoken",
      message: "Github OAuth token (this will not be saved - set env. var. GIT_TOKEN to skip):",
      when: response => {
        return (response.createscm && !this.gittoken);
      },
      required: true,
      validate: token => {
        this.gittoken = token;
        return true;
      }
    }, {
      type: "input",
      name: "scmhost",
      message: "Source Control Management hostname:",
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
            feedback.info("retrieved info for " + userInfo.login);
            return true;
          },
          err => {
            feedback.warn("could not authenticate to " + host + ": " + err.message);
            return false;
          }
        )
      }
    }, {
      type: "list",
      name: "organization",
      message: "Organization to own repository:",
      choices: () => {
        return this.github.getOrganizations()
          .then(orgs => {
            feedback.info(orgs);
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
    return this.prompt(prompts).then(props => {
      return props;
    }).then(props => {
      let repoPrompt = [{
        type: "input",
        name: "repository",
        message: "Repository name:",
        when: responses => {
          return props.createscm;
        },
        default: scmInfo.repository,
        validate: repo => {
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
                feedback.warn("could not validate repo: " + err.message);
                return Promise.resolve(false);
              });
        }
      }];

      return this.prompt(repoPrompt).then(newProps => {
        let scmInfo = {
          active: props.createscm,
          scmtool: props.scmtool,
          scmhost: props.scmhost,
          organization: props.organization,
          repository: newProps.repository
        }
        console.log(scmInfo);
        this.config.set('scm', scmInfo);
        this.config.save();

        if (props.gittoken) {
          this.gittoken = props.gittoken;
        }
      });
    });
  },

  writing: function() {
    feedback.info("scm is writing");
    let scmInfo = this.config.get('scm');
    let cmInfo = this.config.get('cm');
    let cmImplInfo = this.config.get(cmInfo.generatorName);

    console.log('scmInfo.scmtool: ' + scmInfo.scmtool);
    switch (scmInfo.scmtool) {
      case SCM_TOOL_GITHUB:
        feedback.info("dest root: " + this.destinationRoot());
        this.github.createOrgRepository(scmInfo.organization, scmInfo.repository, cmInfo.shortdescription)
          .then(repo => {
              return this.github.init(this.destinationRoot());
            },
            err => {
              feedback.warn("Could not create repository: " + err.message);
              process.exit(1);
            })
          .then(() => {
            let url = [
                        'https://' + scmInfo.scmhost,
                        scmInfo.organization,
                        scmInfo.repository
                      ].join('/');
            return this.github.setOrigin(this.destinationRoot(), url);
          })
          .then(repo => {
            console.log("adding content of project directory");
            return this.github.add(this.destinationRoot(), cmInfo.authorname, cmInfo.authoremail, 'created by generator-bakery');
          })
          .then(() => {
            return this.github.push(this.destinationRoot());
          })
          .then(repo => {
            let url = [
                        'https://' + scmInfo.scmhost,
                        scmInfo.organization,
                        scmInfo.repository
                      ].join('/');
            return this.github.setOrigin(this.destinationRoot(), url);
          });
        // need to implement this...
        break;
      default:
        feedback.warn('SCM toolset ' + tool + ' is not currently available. Skipping SCM script setup');
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
