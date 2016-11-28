/** @module api/github */
'use strict';

/*
 * Imports
 */
const debug = require('debug')('bakery:lib:github');
const feedback = require('./feedback');
const github = require('octonode');
const NodeGit = require('nodegit');
const path = require('path');
const net = require('net');

const HTTPS_PORT = 443;
const CONNECTION_TIMEOUT = 5000;

class Github {
  constructor(hostname, credentials = {
    type: 'none'
  }, username = null, apiPath = '/api/v3') {
    this.userName = username;
    this.hostname = hostname;
    this.apiPath = apiPath;

    let clientConfig = {
      hostname: this.hostname + this.apiPath
    };

    this.credentialType = credentials.type;
    switch (this.credentialType) {
    case 'none':
      this.client = github.client(null, clientConfig);
      break;
    case 'accessToken':
      this.client = github.client(credentials.accessToken, clientConfig);
      this.accessToken = credentials.accessToken;
      break;
    default:
      this.client = github.client(credentials, clientConfig);
    }
    this.testConnection();
  }

  set username(user) {
    this.userName = user;
  }

  get username() {
    if (this.userName) {
      return Promise.resolve(this.userName);
    }
    if (this.accessToken) {
      return this.getUserInfo().then(
        result => {
          this.userName = result.login;
          return Promise.resolve(this.userName);
        },
        err => {
          return Promise.reject(err);
        }
      );
    }
  }

  testConnection() {
    feedback.info('Testing connection to GitHub');
    return new Promise((resolve, reject) => {
      const socket = net.connect(HTTPS_PORT, this.hostname, () => {
        socket.destroy();
        resolve();
      });
      socket.setTimeout(CONNECTION_TIMEOUT);
      socket.on('timeout', _ => {
        socket.destroy();
        return reject(new Error('Connection to ' + this.hostname +
          ' timed out'));
      });
    });
  }

  resolveResponse(func) {
    return new Promise((resolve, reject) => {
      func((err, data, headers) => {
        if (err) {
          if (err.statusCode === 404) {
            return resolve(null);
          }

          if (err.body) {
            debug('Error calling GitHub method \'' + func.name +
              '\': ', err.body);
          }

          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  gitOptions() {
    let token = this.accessToken;
    return {
      fetchOpts: {
        callbacks: {
          certificateCheck: function () {
            return 1;
          },
          credentials: function () {
            return NodeGit.Cred.userpassPlaintextNew(token, 'x-oauth-basic');
          }
        }
      }
    };
  }

  getUserInfo() {
    var ghme = this.client.me();
    feedback.info('getting user info');
    return this.resolveResponse(ghme.info.bind(ghme));
  }

  getOrganizations() {
    var ghme = this.client.me();
    return this.resolveResponse(ghme.orgs.bind(ghme));
  }

  createOrgRepository(org, name, description) {
    let config = {
      name: name,
      description: description
    };

    let ghorg = this.client.org(org);
    return this.getRepoInfo(org, name)
      .then(exists => {
        if (exists) {
          return Promise.reject(new Error('Repository ' + org + '/' + name +
            ' already exists'));
        } else {
          return new Promise((resolve, reject) => ghorg.repo(config,
              function (err, data, headers) {
                if (err) {
                  return reject(err);
                }
                return resolve(data);
              }) //repo
          );
        }
      });
  }

  createUserRepository(name, description) {
    return this.username
      .then(
        username => {
          let config = {
            name: name,
            description: description
          };
          let ghme = this.client.me();
          return this.getRepoInfo(username, name)
            .then(exists => {
              if (exists) {
                return Promise.reject(new Error('Repository ' + username +
                  '/' + name + ' already exists'));
              } else {
                return new Promise((resolve, reject) => ghme.repo(config,
                    function (err, data, headers) {
                      if (err) {
                        return reject(err);
                      }
                      return resolve(data);
                    }) //repo
                );
              }
            });
        },
        err => {
          return Promise.reject(
            'Could not obtain username. Ensure username is supplied to constructor, set, or authentication is via an OAuth token with \'user\' scope.'
          );
        }
      );
  }

  deleteRepo(orgOrUser, name) {
    let repo = this.client.repo(orgOrUser + '/' + name);
    return this.resolveResponse(repo.destroy.bind(repo));
  }

  getRepoInfo(orgOrUser, name) {
    let repo = this.client.repo(orgOrUser + '/' + name);
    return this.resolveResponse(repo.info.bind(repo));
  }

  init(repoPath) {
    let p = path.resolve(repoPath);
    return NodeGit.Repository.init(p, 0);
  }

  remoteUrl(owner, name) {
    return [
      'https://' + this.hostname,
      owner,
      name
    ].join('/');
  }

  clone(orgOrUser, repo, dir, branch = 'master') {
    let url = this.remoteUrl(orgOrUser, repo) + '.git';
    let opts = this.gitOptions();
    if (branch) {
      opts.checkoutBranch = branch;
    }

    debug('Clone: creating clone at: %j', dir);
    return NodeGit.Clone(url, dir, opts);
  }

  push(repoPath, branch = 'master', remote = 'origin') {
    let ref = 'refs/heads/' + branch;
    return NodeGit.Repository.open(repoPath)
      .then((repository) => {
        return NodeGit.Remote.lookup(repository, remote);
      })
      .then((remote) => {
        let token = this.accessToken;
        feedback.notice('Pushing to %j', remote.name());
        return remote.push(
          [ref + ':' + ref], {
            callbacks: {
              credentials: (url, userName) => {
                return NodeGit.Cred.userpassPlaintextNew(token,
                  'x-oauth-basic');
              }
            }
          });
      });
  }

  listRemotes(repoPath) {
    let p = path.resolve(repoPath);
    return NodeGit.Repository.open(p)
      .then((repository) => {
        return NodeGit.Remote.list(repository);
      });
  }

  addRemote(repoPath, remoteName, url) {
    let p = path.resolve(repoPath);
    return this.listRemotes(repoPath)
      .then(list => {
        return list.includes(remoteName);
      })
      .then(exists => {
        return NodeGit.Repository.open(p)
          .then(repository => {
            if (exists) {
              feedback.info('A remote for %s already exists. Skipping...',
                remoteName);
              return NodeGit.Remote.lookup(repository, remoteName);
            } else {
              feedback.info('Assigning remote for %s to %s', url,
                remoteName);
              return NodeGit.Remote.create(repository, remoteName, url);
            }
          });
      });
  }

  setUpstream(repoPath, url) {
    return this.addRemote(repoPath, 'upstream', url);
  }

  setOrigin(repoPath, url) {
    return this.addRemote(repoPath, 'origin', url);
  }

  fork(orgOrUser, name) {
    let ghme = this.client.me();
    let repo = orgOrUser + '/' + name;

    return new Promise((resolve, reject) => {
      ghme.fork(repo, (err, data, headers) => {
        if (err) {
          if (err.body) {
            debug('Error calling GitHub method \'' + ghme.fork.name +
              '\': ', err.body);
          }

          return reject(err);
        }
        resolve(data);
      });
    });
  }

  trimSHA(data) {
    return data && data.commit && data.commit.sha ? data.commit.sha.substring(
      0, 7) : '';
  }

  lastCommit(orgOrUser, reponame, branch) {
    return new Promise((resolve, reject) => {
      this.client.repo(orgOrUser + '/' + reponame).branch(branch.trim(),
        function (err, data, headers) {
          if (err) {
            return reject(err);
          }
          resolve(this.trimSHA(data));
        });
    });
  }

  add(repoPath, author, email, comment, fileSpec = null) {
    let p = path.resolve(repoPath);

    let tempRepo;
    let tempIndex;

    return NodeGit.Repository.open(p)
      .then(repo => {
        tempRepo = repo;
        return repo.refreshIndex();
      })
      .then(index => {
        tempIndex = index;
        return index.addAll(fileSpec);
      })
      .then(() => {
        return tempIndex.write();
      })
      .then(() => {
        return tempIndex.writeTree();
      })
      .then(oid => {
        let auth = NodeGit.Signature.now(author, email);
        let committer = NodeGit.Signature.now(author, email);
        return tempRepo.createCommit('HEAD', auth, committer, comment, oid, []);
      });
  }
}

module.exports = {
  Github
};
