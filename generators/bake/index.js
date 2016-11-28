'use strict';
var yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  bakery = require('../../lib/bakery'),
  feedback = require('../../lib/feedback'),
  debug = require('debug')('bakery:generators:bake:index'),
  _ = require('lodash');

const AWS_REGIONS = [{
  name: 'us-east-1',
  checked: true
}, {
  name: 'us-east-2'
}, {
  name: 'us-west-1'
}, {
  name: 'us-west-2'
}, {
  name: 'ap-south-1'
}, {
  name: 'ap-northeast-1'
}, {
  name: 'ap-southeast-1'
}, {
  name: 'ap-southeast-2'
}, {
  name: 'ap-northeast-1'
}, {
  name: 'eu-central-1'
}, {
  name: 'eu-west-1'
}, {
  name: 'sa-east-1'
}];
const AWS_INSTANCE_TYPES = ['t2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large', 'm4.large', 'm4.xlarge', 'm4.2xlarge', 'm4.4xlarge', 'm4.8xlarge', 'm4.16xlarge', 'c4.large', 'c4.xlarge', 'c4.2xlarge', 'c4.4xlarge', 'c4.8xlarge'];

var BakeryBake = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    this.argument('projectname', {
      type: String,
      required: true
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation'
    });
  },

  initializing: function () {
    let gen_defaults = {
      bake: {
        active: true,
        aminame: this.projectname + ' {{timestamp}}',
        awsregions: ['us-west-2'],
        buildimagetype: 't2.large',
        regionspecificami: 'ami-c8580bdf'
      }
    };
    this.config.defaults(gen_defaults);
  },

  prompting: function () {
    // preserve 'this' reference across scopes
    var _this = this;
    this.log(bakery.banner('Bakery Setup!'));

    // The primary region is needed in order to validate AMI ID. In order to access primary region the prompts
    // must be run and their results processed. For this reason the prompts are split into two groups:
    //    initialPrompts - these run to gather everything up to primary region
    //    prompts - all remaining prompts
    //
    // This required a few accomodations:
    //   1) numerous anonymous handler functions are supplied in the prompts below. 'this' is captured as '_this'
    //      to ensure the proper identity object is available across function scopes.
    //
    //   2) all prompt values must be stored somewhere on the generator object. The handler function for prompt
    //      results therefore simply adds prompt values to _this.options
    //
    //   3) this.prompt is async and returns a Promise. To ensure initialPrompts have been processed before the
    //      remaining prompts, the call to this.prompt for the remainder is nested in a call to .then() on the
    //      Promise returned from the first this.prompt call.

    // define initial prompts
    let bakeInfo = this.config.get('bake');
    var initialPrompts = [{
      type: 'confirm',
      name: 'createami',
      message: 'Create Amazon Machine Image?',
      default: bakeInfo.active
    }, {
      type: 'input',
      name: 'aminame',
      message: 'Name for this AMI:',
      default: bakeInfo.aminame,
      when: function (response) {
        return response.createami;
      }
    }, {
      type: 'input',
      name: 'amidescription',
      message: 'Enter a description for this AMI:',
      when: function (response) {
        return response.createami;
      },
      default: bakeInfo.amidescription
    }, {
      type: 'checkbox',
      name: 'awsregions',
      message: 'Choose AWS Region(s) for creation',
      choices: AWS_REGIONS,
      when: function (response) {
        return response.createami;
      },
      default: bakeInfo.awsregions,
      validate: function (response) {
        if (response.length < 0) {
          return 'You must choose at least one AWS Region.';
        }
        return true;
      }
    }, {
      type: 'list',
      name: 'primaryregion',
      message: 'Choose a primary region for building in AWS:',
      when: function (response) {
        if (!response.createami) {
          return false;
        }
        if (response.awsregions.length == 1) {
          _this.options.primaryregion = response.awsregions[0];
        }
        return response.awsregions.length > 1;
      },
      choices: function (response) {
        return response.awsregions;
      },
      default: function (response) {
        if (bakeInfo.primaryregion) {
          return bakeInfo.primaryregion;
        } else if (response.awsregions.indexOf('us-west-2') > -1) {
          return 'us-west-2';
        } else {
          return response.awsregions[0];
        }
      }
    }];

    // this runs the first set of prompts and returns the resulting Promise to cause the Yeoman
    //  run loop to pause until prompts are complete
    return this.prompt(initialPrompts).then(function (responses) {
      console.log('-----------------------------------');
      // copy responses into this.options
      bakeInfo.active = responses.createami;
      bakeInfo.aminame = responses.aminame;
      bakeInfo.amidescription = responses.amidescription;
      bakeInfo.awsregions = responses.awsregions;
      bakeInfo.primaryregion = responses.primaryregion;

      // define the remaining prompts
      var prompts = [{
        type: 'list',
        name: 'buildimagetype',
        message: 'Instance Type for build:',
        default: bakeInfo.buildimagetype,
        choices: AWS_INSTANCE_TYPES,
        when: function (response) {
          return bakeInfo.active;
        }
      }, {
        type: 'input',
        name: 'regionspecificami',
        message: function (response) {
          return 'AMI ID in ' + bakeInfo.primaryregion + ' region:';
        },
        default: bakeInfo.regionspecificami,
        when: function (response) {
          return bakeInfo.active;
        },
        validate: function (response) {
            // validate that the AMI exists - send primary region; for profile defualt to:
            //    1) --awsprofile/-p argument
            //    2) Environment variable AWS_POFILE
            //    3) default
          return bakery.validateAMIId(response, {
            awsregion: bakeInfo.primaryregion,
            awsprofile: bakeInfo.awsprofile || process.env.AWS_PROFILE || 'default'
          }).then(function (successful) {
            return successful;
          }, function (err) {
            feedback.warn('error while looking up AMI: ' + err.message);
            return false;
          }).catch(err => {
            feedback.warn('error while looking up AMI: ' + err.message);
            return false;
          });
        }
      }, {
        type: 'confirm',
        name: 'iswindows',
        message: 'Is this a Windows-based image:',
        default: function () {
          return bakeInfo.iswindows != undefined ? bakeInfo.iswindows : process.env.WINDOWSIMAGE || false;
        },
        when: function (response) {
          return bakeInfo.active;
        }
      },
        // {
        //   type: 'input',
        //   name: 'amigroups',
        //   message: 'Enter a list (comma separated) of groups to share this AMI with:',
        //   when: function(response) {
        //     return _this.options.createami;
        //   }
        // }, {
        //   type: 'input',
        //   name: 'amiusers',
        //   message: 'Enter a list of (comma separated) account id\'s to share this AMI with:',
        //   when: function(response) {
        //     return _this.options.createami;
        //   }
        // }, {
        //   type: 'input',
        //   name: 'iaminstanceprofile',
        //   message: 'Enter the IAM instance profile id you want to apply to instances while they are being built:',
        //   when: function(response) {
        //     return _this.options.createami;
        //   }
        // },
        {
          type: 'input',
          name: 'vpcid',
          message: 'Enter VPC ID, leave blank for default VPC:',
          when: function (response) {
            return bakeInfo.active;
          },
          default: bakeInfo.vpcid
        }, {
          type: 'input',
          name: 'subnetid',
          message: 'Enter subnet id - Required for non-default VPC ID:',
          when: function (response) {
            return bakeInfo.active && response.vpcid.length > 0;
          },
          default: bakeInfo.subnetid
        }, {
          type: 'input',
          name: 'securitygroupids',
          message: 'Enter security group ids (comma separated) - required for non-default VPC ID:',
          when: function (response) {
            return bakeInfo.active && response.vpcid.length > 0;
          },
          default: bakeInfo.securitygroupids
        }
      ];
      return _this.prompt(prompts).then(function (props) {
        bakeInfo.buildimagetype = props.buildimagetype;
        bakeInfo.regionspecificami = props.regionspecificami;
        bakeInfo.iswindows = props.iswindows;
        bakeInfo.vpcid = props.vpcid;
        bakeInfo.subnetid = props.subnetid;
        bakeInfo.securitygroupids = props.securitygroupids;

        this.config.set('bake', bakeInfo);
        this.config.save();

        // does this belong here?
        /*
        switch (process.env.CI_TYPE) {
          case 'drone':
            //do something
            break;
          case 'jenkins':
            //do something
            break;
          default:
            _this.log('CI toolset ' + process.env.CI_TYPE + ' is not currently available. Skipping CI script setup');
            break;
        }
        */
      }.bind(_this));
    });
  },

  writing: function () {
    let bakeInfo = this.config.get('bake');
    if (!bakeInfo.active) {
      return;
    }

    var bake_json = this.fs.readJSON(this.templatePath('packer.json'));

    if (typeof bake_json === 'undefined' || bake_json == null) {
      bake_json = {};
    }

    if (!('builders' in bake_json) || bake_json.builders.length == 0) {
      bake_json.builders = [{}];
    }

    // creates the builder block
    bake_json.builders[0].region = bakeInfo.primaryregion;
    bake_json.builders[0].source_ami = bakeInfo.regionspecificami;
    bake_json.builders[0].instance_type = bakeInfo.buildimagetype;
    if (bakeInfo.awsregions.length > 1) {
      bake_json.builders[0].ami_regions = [];
      bakeInfo.awsregions.forEach(function (element) {
        if (element != bakeInfo.primaryregion) {
          bake_json.builders[0].ami_regions.push(element);
        }
      });
    }
    if (typeof bakeInfo.amidescription !== 'undefined' && bakeInfo.amidescription.length > 0) {
      bake_json.builders[0].ami_description = bakeInfo.amidescription;
    }
    if (typeof bakeInfo.amigroups !== 'undefined' && bakeInfo.amigroups.length > 0) {
      bake_json.builders[0].ami_groups = bakeInfo.amigroups.split(',');
    }
    if (typeof bakeInfo.amiusers !== 'undefined' && bakeInfo.amiusers.length > 0) {
      bake_json.builders[0].ami_users = bakeInfo.amiusers.split(',');
    }
    if (typeof bakeInfo.vpcid !== 'undefined' && bakeInfo.vpcid.length > 0) {
      bake_json.builders[0].vpc_id = bakeInfo.vpcid;
    }
    if (typeof bakeInfo.subnetid !== 'undefined' && bakeInfo.subnetid.length > 0) {
      bake_json.builders[0].subnet_id = bakeInfo.subnetid;
    }
    if (typeof bakeInfo.securitygroupids !== 'undefined' && bakeInfo.securitygroupids.length > 0) {
      bake_json.builders[0].security_group_ids = bakeInfo.securitygroupids.split(',');
    }
    if (typeof bakeInfo.iaminstanceprofile !== 'undefined' && bakeInfo.iaminstanceprofile.length > 0) {
      bake_json.builders[0].iam_instance_profile = bakeInfo.iaminstanceprofile;
    }

    var bake_tpl = this.fs.extendJSON(this.destinationPath('packer.json'), bake_json);

  },

  default: {},

  install: function () {
    this.installDependencies();
  }
});

module.exports = BakeryBake;
