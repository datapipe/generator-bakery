'use strict';

var assert = require('assert'),
    expect = require('chai').expect,
    //github = require('../lib/github.js'),
    _ = require('underscore'),
    fs = require('fs-extra'),
    Client = require('node-rest-client').Client,
    exec = require('child-process-promise').exec,
    Github = require('../lib/github.js').Github;

// options hash for calls to github library
var repo_opts = {
  accessToken: process.env.GITHUB_API_ACCESS_TOKEN,
  hostname: process.env.GITHUB_HOSTNAME,
  username: process.env.GITHUB_USER,
  org: process.env.GITHUB_ORG,
  reponame: "test-" + process.env.GITHUB_USER + "-" + (new Date()).getTime()
}

// fail if these are not set -- set them as environment variables if needed. see testing.sh.example
repo_opts.accessToken || assert.fail("GITHUB_API_ACCESS_TOKEN must be defined for testing")
repo_opts.hostname || assert.fail("GITHUB_HOSTNAME must be defined for testing")
repo_opts.username || assert.fail("GITHUB_USER must be defined for testing")
repo_opts.org || assert.fail("GITHUB_ORG must be defined for testing")
/*
describe("test connection", function() {
  //no, really... it sucks to beat one's head against the desk wondering
  // why the test that ran last night doesn't run not... good to know
  // when the VPN is not connected ;-)
  it("provides assurance of connectivity to " + repo_opts.hostname + " before testing", function(done) {
    // make sure the test does not timeout before testConnection does
    this.timeout(5000);
    var result = github.testConnection(repo_opts.hostname);
    return result
    .then(
      function(data) {
        done();
      },
      function(error) {
        assert.fail(error);
        done();
      }
    );
  });
});

// test that user info returns successfully - nice low bar for end-to-end config
describe("getUserInfo", function() {
  it("returns correct information", function(done) {
    github.getGitUser(repo_opts)
        .then(
          function(result) {
            expect(result.login).to.equals(repo_opts.username);
            done();
          },
          function(error) {
            assert.fail(error);
            done();
          }
        )
        .catch( function(error) {
          assert.fail(error);
          done();
        });
  });
});

// test the real workhorse of the github library
describe("publishToGithub", function(done) {
  let reponame = repo_opts.reponame;
  let workingDir = "../" + reponame;
  let repofile = workingDir + "/README.md";

  // create a local repo to push to github
  before(function() {
    fs.ensureDirSync(workingDir);
    fs.writeFile(repofile, "# TESTING", function(err) {
      if(err) {
        assert.fail(err);
      }
    });
    var git_stuff = exec('git init', {cwd: workingDir})
      .then(function(result) {
        return exec('git add README.md', {cwd: workingDir});
      },
      function(err) {
        return Promise.reject(err);
      }).then(function(result) {
        return exec('git commit -m "initial commit"', {cwd: workingDir});
      },function(err) {
        return Promise.reject(err);
      });
  });

  // clean up local repo and remove remote git repos
  after(function() {
    fs.removeSync(workingDir);

    let client = new Client();
    let orgUrl = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.org + "/" + reponame;
    let userUrl = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.username + "/" + reponame;
    let args = {
      headers: {
        "User-Agent": "mocha test",
        "Authorization": "token " + repo_opts.accessToken
      }
    };
    return new Promise(function(resolve, reject){
      let request = client.delete(orgUrl, args, function(data, response) {
        if (response.statusCode != 204) {
          let msg = "WARNING!!! test repository " + repo_opts.org + "/" + reponame + " was not deleted!"
          assert.fail(msg);
          return reject(msg)
        }
        return resolve();
      });
    }).then(result => {
      let request = client.delete(userUrl, args, function(data, response) {
        if (response.statusCode != 204) {
          let msg = "WARNING!!! test repository " + repo_opts.org + "/" + reponame + " was not deleted!"
          assert.fail(msg);
          return Promise.reject(msg)
        }
        return Promise.resolve();
      });
    });
  });

  it("creates repository '" + repo_opts.reponame + "'in " + repo_opts.org + " and in " + repo_opts.username, function(done) {
    this.timeout(10000);
    let opts = _.clone(repo_opts);
    opts.reponame = reponame;
    let result = github.publishToGithub(opts);
    return result
      .then(
        function(data) {
          let url = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.org + "/" + repo_opts.reponame + "/readme";
          let args = {
            headers: {
              "User-Agent": "mocha test",
              "Authorization": "token " + repo_opts.accessToken
            }
          }
          return new Promise(function(resolve, reject) {
            let client = new Client();
            let request = client.get(url, args, function(data, response) {
              if (response.statusCode == 200) {
                done();
                return resolve();
              } else {
                err = response.statusCode + ": " + data;
                assert.fail(err)
                done();
                return reject(err);
              }
            });
          });
        },
        function(error) {
          assert.fail(error);
          done();
        }
      )
      .then(
        function(data) {
          let url = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.username + "/" + repo_opts.reponame + "/readme";
          let args = {
            headers: {
              "User-Agent": "mocha test",
              "Authorization": "token " + repo_opts.accessToken
            }
          }
          return new Promise(function(resolve, reject) {
            let client = new Client();
            let request = client.get(url, args, function(data, response) {
              if (response.statusCode == 200) {
                return resolve();
              } else {
                let err = response.statusCode + ": " + response.body;
                assert.fail(err)
                return reject(err);
              }
            });
          });
        },
        function(error) {
          assert.fail(error);
          done();
        }
      )
      .catch(
        function(error) {
          assert.fail(error);
          done();
        }
      );
  });
});
*/
describe('new Github class', function() {
  let credentials = {
    type: 'accessToken',
    accessToken: repo_opts.accessToken
  }
  let github = new Github(repo_opts.username, repo_opts.hostname, credentials);

  it('gets User Info', function(done) {
    return github.getUserInfo()
    .then(
      function(result) {
        expect(result.login).to.equals(repo_opts.username);
        done();
      },
      function(error) {
        assert.fail(error);
        done();
      }
    )
    .catch( function(error) {
      assert.fail(error);
      done();
    });
  });

  it('creates and deletes user repositories', function() {
    this.timeout(30000);
    let reponame = 'lib_github_test_repo';
    return github.createUserRepository(reponame, 'this is just a test')
      .then(github.getRepoInfo(repo_opts.username, reponame))
      .then(repoInfo => {
        expect(repoInfo.name).to.equals(reponame);
        return github.deleteRepo(repo_opts.username, reponame);
      });
  });

  it('creates and deletes org repositories', function() {
    this.timeout(30000);
    let reponame = 'lib_github_test_repo';
    return github.createOrgRepository(repo_opts.org, reponame, 'this is just a test')
      .then(github.getRepoInfo(repo_opts.org, reponame))
      .then(repoInfo => {
        expect(repoInfo.name).to.equals(reponame);
        return github.deleteRepo(repo_opts.org, reponame);
      });
  });
});

describe("GitHub.local", function() {
  let credentials = {
    type: 'accessToken',
    accessToken: repo_opts.accessToken
  }
  let github = new Github(repo_opts.username, repo_opts.hostname, credentials);

  let tmpDir = "/tmp/github_test_" + (new Date()).getTime();
  let repo = tmpDir + "/repo";
  let notARepo = tmpDir + "/notarepo";
  let repofile = "README.md";

  before(function() {
    return new Promise((resolve, reject) => {
      fs.ensureDirSync(repo);
      fs.ensureDirSync(notARepo);
      fs.writeFileSync(repo + "/" + repofile, "# TESTING", err => { assert.fail(err); });
      fs.writeFileSync(notARepo + "/" + repofile, "# TESTING", err => { assert.fail(err); });
      var git_stuff = exec('git init', {cwd: repo})
        .then(function(result) {
          return exec('git add README.md', {cwd: repo});
        },
        function(err) {
          return reject(err);
        }).then(function(result) {
          return exec('git commit -m "initial commit"', {cwd: repo});
        },function(err) {
          return reject(err);
        });
      return resolve();
    });
  });

  // clean up local repo and remove remote git repos
  after(function() {
    fs.removeSync(tmpDir);
  });
  /*
    let client = new Client();
    let orgUrl = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.org + "/" + reponame;
    let userUrl = "https://" + repo_opts.hostname + "/api/v3/repos/" + repo_opts.username + "/" + reponame;
    let args = {
      headers: {
        "User-Agent": "mocha test",
        "Authorization": "token " + repo_opts.accessToken
      }
    };
    return new Promise(function(resolve, reject){
      let request = client.delete(orgUrl, args, function(data, response) {
        if (response.statusCode != 204) {
          let msg = "WARNING!!! test repository " + repo_opts.org + "/" + reponame + " was not deleted!"
          assert.fail(msg);
          return reject(msg)
        }
        return resolve();
      });
    }).then(result => {
      let request = client.delete(userUrl, args, function(data, response) {
        if (response.statusCode != 204) {
          let msg = "WARNING!!! test repository " + repo_opts.org + "/" + reponame + " was not deleted!"
          assert.fail(msg);
          return Promise.reject(msg)
        }
        return Promise.resolve();
      });
    });
  });
*/
  it ("inits a repo", function() {
    return github.init(notARepo)
      .then(result => {
        assert(fs.existsSync(notARepo + "/.git"));
        return Promise.resolve(true);
      })
      .catch(err => {
        return Promise.reject(err);
      });
  });

  it ("errors if initing an existing repo", function() {
    return github.init(repo)
      .then(result => {
        assert.fail('should not init an existing repo');
        return Promise.reject(new Error('allowed init of exiting repo'));
      })
      .catch(err => {
        return Promise.resolve();
      });
  });

  it ("lists remotes", function() {
    return github.listRemotes(repo)
      .then(result => {
        expect(result[0]).to.equals('origin');
      });
  });

});
