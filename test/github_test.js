'use strict';

const assert = require('assert');
const expect = require('chai').expect;
const githubLib = require('../lib/github.js');
const _ = require('underscore');
const fs = require('fs-extra');
const Client = require('node-rest-client').Client;
const exec = require('child-process-promise').exec;
const cpExec = require('child_process').exec;
const Github = require('../lib/github.js').Github;

// options hash for calls to github library
let repoOpts = {
  accessToken: process.env.GITHUB_API_ACCESS_TOKEN,
  hostname: process.env.GITHUB_HOSTNAME,
  username: process.env.GITHUB_USER,
  org: process.env.GITHUB_ORG,
  reponame: 'test-' + process.env.GITHUB_USER + '-' + (new Date()).getTime()
};

// fail if these are not set -- set them as environment variables if needed. see testing.sh.example
repoOpts.accessToken || assert.fail(
  'GITHUB_API_ACCESS_TOKEN must be defined for testing');
repoOpts.hostname || assert.fail('GITHUB_HOSTNAME must be defined for testing');
repoOpts.username || assert.fail('GITHUB_USER must be defined for testing');
repoOpts.org || assert.fail('GITHUB_ORG must be defined for testing');

let credentials = {
  type: 'accessToken',
  accessToken: repoOpts.accessToken
};
let github = new Github(repoOpts.hostname, credentials);

describe('Github class remote actions', function () {

  it('gets User Info', function (done) {
    return github.getUserInfo()
      .then(
        function (result) {
          expect(result.login).to.equals(repoOpts.username);
          done();
        },
        function (error) {
          assert.fail(error);
          done();
        }
      )
      .catch(function (error) {
        assert.fail(error);
        done();
      });
  });

  it('creates and deletes user repositories', function () {
    this.timeout(30000);
    let reponame = 'lib_github_test_repo';
    return github.createUserRepository(reponame, 'this is just a test')
      .then(github.getRepoInfo(repoOpts.username, reponame))
      .then(repoInfo => {
        expect(repoInfo.name).to.equals(reponame);
        return github.deleteRepo(repoOpts.username, reponame);
      });
  });

  it('creates and deletes org repositories', function () {
    this.timeout(30000);
    let reponame = 'lib_github_test_repo';
    return github.createOrgRepository(repoOpts.org, reponame,
        'this is just a test')
      .then(github.getRepoInfo(repoOpts.org, reponame))
      .then(repoInfo => {
        expect(repoInfo.name).to.equals(reponame);
        return github.deleteRepo(repoOpts.org, reponame);
      });
  });

  it('forks a repo', function () {
    this.timeout(30000);
    let reponame = process.env.GITHUB_REPO_TO_FORK;
    return github.fork(repoOpts.org, reponame)
      .catch(err => {
        console.error('failed to fork repo: ' + err.message);
        return Promise.reject(err);
      })
      .then(github.getRepoInfo(repoOpts.username, reponame))
      .then(repoInfo => {
        expect(repoInfo.name).to.equals(reponame);
      })
      .then(github.deleteRepo(repoOpts.username, reponame));
  });

});

describe('Github class local working directory actions', function () {
  this.timeout(10000);

  let tmpDir = '/tmp/github_test';
  let repo = tmpDir + '/repo';
  let notARepo = tmpDir + '/notarepo';
  let repofile = 'README.md';

  // setup a local repo directory and a non-repo directory
  before(function () {
    fs.ensureDirSync(repo);
    fs.ensureDirSync(notARepo);
    fs.writeFileSync(repo + '/' + repofile, '# TESTING', err => {
      assert.fail(err);
    });
    fs.writeFileSync(notARepo + '/' + repofile, '# TESTING', err => {
      assert.fail(err);
    });
  });

  // init repository
  before(function () {
    return exec('git init', {
      cwd: repo
    });
  });

  // add a file to the repo
  before(function () {
    return exec('git add README.md', {
      cwd: repo
    });
  });

  // add a file to the repo
  before(function () {
    return exec('git commit -m \'initial commit\'', {
      cwd: repo
    });
  });

  // add a remote to the repo
  before(function () {
    let cmd = 'git remote add origin https://' + [repoOpts.hostname,
      repoOpts.username, 'repo'
    ].join('/') + '.git';
    return exec(cmd, {
      cwd: repo
    });
  });

  // clean up local repo and remove remote git repos
  after(function () {
    let newHome = tmpDir + '.bak';
    fs.move(tmpDir, newHome, {
      clobber: true
    }, err => {
      if (err) {
        return console.error(err);
      }
    });
  });

  it('inits a repo', function () {
    return github.init(notARepo)
      .then(result => {
        assert(fs.existsSync(notARepo + '/.git'));
        return Promise.resolve(true);
      })
      .catch(err => {
        return Promise.reject(err);
      });
  });

  it('errors if initing an existing repo', function () {
    return github.init(repo)
      .then(result => {
        assert.fail('should not init an existing repo');
        return Promise.reject(new Error(
          'allowed init of exiting repo'));
      })
      .catch(err => {
        return Promise.resolve();
      });
  });

  it('lists remotes', function () {
    return github.listRemotes(repo)
      .then(result => {
        expect(result[0]).to.equals('origin');
      });
  });

  it('adds a remote', function () {
    let remoteUrl = 'https://github.com/mochajs/mocha.git';
    return github.addRemote(repo, 'test', remoteUrl)
      .then(result => {
        let remotes = github.listRemotes(repo).then(result => {
          expect(remotes).to.contain('test');
        });
      });
  });
});

describe('full workflow', function () {
  let tmpDir = '/tmp/github_workflow_test';
  let repo = tmpDir + '/repo';
  let notARepo = tmpDir + '/notarepo';
  let repofile = 'README.md';

  // setup a local repo directory and a non-repo directory
  before(function () {
    fs.ensureDirSync(repo);
    fs.writeFileSync(repo + '/' + repofile, '# TESTING', err => {
      assert.fail(err);
    });
  });

  // init repository
  before(function () {
    return exec('git init', {
      cwd: repo
    });
  });

  // add a file to the repo
  before(function () {
    return exec('git add README.md', {
      cwd: repo
    });
  });

  // add a file to the repo
  before(function () {
    return exec('git commit -m \'initial commit \'', {
      cwd: repo
    });
  });

  after(function () {
    return github.deleteRepo(repoOpts.username, 'lib_github_test_repo');
  });

  // clean up local repo and remove remote git repos
  after(function () {
    let newHome = tmpDir + '.bak';
    fs.move(tmpDir, newHome, {
      clobber: true
    }, err => {
      if (err) {
        return console.error(err);
      }
    });
  });

  it('creates a repo', function () {
    this.timeout(30000);
    let reponame = 'lib_github_test_repo';
    let remoteUrl = [
      'https://' + repoOpts.hostname,
      repoOpts.username,
      reponame
    ].join('/');

    return github.createUserRepository(reponame, 'this is just a test')
      .then(repository => {
        return github.setOrigin(repo, remoteUrl);
      })
      .then(remote => {
        return github.push(repo);
      })
      .then(remote => {
        return github.clone(repoOpts.username, reponame, notARepo);
      })
      .then(repo => {
        assert(fs.existsSync(notARepo + '/README.md'));
        return Promise.resolve(repo);
      });
  });
});
