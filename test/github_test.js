'use strict';

var assert = require('assert'),
    expect = require('chai').expect,
    github = require('../lib/github.js');

var repo_opts = {
  accessToken: process.env.GITHUB_API_ACCESS_TOKEN,
  hostname: process.env.GITHUB_HOSTNAME,
  username: process.env.GITHUB_USER,
  org: process.env.GITHUB_ORG,
  reponame: "test-" + process.env.GITHUB_USER
}

//console.out('foo')
repo_opts.accessToken || assert.fail("GITHUB_API_ACCESS_TOKEN must be defined for testing")
repo_opts.hostname || assert.fail("GITHUB_HOSTNAME must be defined for testing")
repo_opts.username || assert.fail("GITHUB_USER must be defined for testing")
repo_opts.org || assert.fail("GITHUB_ORG must be defined for testing")

describe("test connection", function() {
  //no, really... it sucks to beat one's head against the desk wondering
  // why the test that ran last night doesn't run not... good to know
  // when the VPN is not connected ;-)
  it("provides assurance of connectivity to github before testing", function(done) {
    // make sure the test does not timeout before testConnection does
    this.timeout(5000);
    var result = github.testConnection();
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
