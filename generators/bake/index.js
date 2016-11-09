'use strict';
const yeoman = require('yeoman-generator'),
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

  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this._options.help.desc = 'Show this help';

    /** @property {object} answers - prompt answers */
    this.answers = {};

    this.option('projectname', {
      desc: 'Name of the project being created',
      type: String,
      alias: 'n'
    });

    this.option('awsprofile', {
      type: String,
      alias: 'p',
      desc: 'Name of the AWS profile to use when calling the AWS api for value validation'
    });
  },

  prompting: function() {
    // preserve 'this' reference across scopes
    var _this = this
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
    var initialPrompts = [{
      type: "confirm",
      name: "createami",
      message: "Create Amazon Machine Image?",
      default: true
    }, {
      type: 'input',
      name: 'aminame',
      message: 'Name for this AMI:',
      default: function() {
        return process.env.PROJECTNAME + ' {{timestamp}}'
      },
      when: function(response) {
        return response.createami && process.env.PROJECTNAME;
      }
    }, {
      type: 'input',
      name: 'amidescription',
      message: 'Enter a description for this AMI:',
      when: function(response) {
        return response.createami;
      }
    }, {
      type: "checkbox",
      name: "awsregions",
      message: "Choose AWS Region(s) for creation",
      choices: AWS_REGIONS,
      when: function(response) {
        return response.createami;
      },
      default: process.env.AWS_REGION || 'us-west-2',
      validate: function(response) {
        if (response.length < 0) {
          return 'You must choose at least one AWS Region.';
        }
        return true;
      }
    }, {
      type: 'list',
      name: 'primaryregion',
      message: 'Choose a primary region for building in AWS:',
      when: function(response) {
        if (!response.createami) return false;
        if (response.awsregions.length == 1) {
          _this.options['primaryregion'] = response.awsregions[0]
        }
        return (response.awsregions.length > 1);
      },
      choices: function(response) {
        return response.awsregions;
      },
      default: function(response) {
        if (response.awsregions.indexOf('us-west-2') > -1) {
          return 'us-west-2';
        } else {
          return response.awsregions[0];
        }
      }
    }];

    // this runs the first set of prompts and returns the resulting Promise to cause the Yeoman
    //  run loop to pause until prompts are complete
    return this.prompt(initialPrompts).then(function(responses) {
      console.log('-----------------------------------');
      // copy responses into this.options
      for(var response in responses) {
        if (responses.hasOwnProperty(response)) {
          _this.options[response] = responses[response];
          console.log(response);
        }
      }

      // define the remaining prompts
      var prompts = [{
        type: 'list',
        name: 'buildimagetype',
        message: 'Instance Type for build:',
        default: 't2.large',
        choices: AWS_INSTANCE_TYPES,
        when: function(response) {
          return _this.options.createami;
        }
      }, {
        type: 'input',
        name: 'regionspecificami',
        message: function(response) {
          return 'AMI ID in ' + _this.options.primaryregion + ' region:';
        },
        default: 'ami-c8580bdf',
        when: function(response) {
          return _this.options.createami;
        },
        validate: function(response) {
          // validate that the AMI exists - send primary region; for profile defualt to:
          //    1) --awsprofile/-p argument
          //    2) Environment variable AWS_POFILE
          //    3) default
          return bakery.validateAMIId(response, {
            awsregion: _this.options.primaryregion,
            awsprofile: _this.options.awsprofile || process.env.AWS_PROFILE || 'default'
          }).then(function(successful) {
            return successful;
          });
        }
      }, {
        type: 'confirm',
        name: 'iswindows',
        message: 'Is this a Windows-based image:',
        default: false,
        when: function(response) {
          return _this.options.createami && !process.env.WINDOWSIMAGE;
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
        when: function(response) {
          return _this.options.createami;
        }
      }, {
        type: 'input',
        name: 'subnetid',
        message: 'Enter subnet id - Required for non-default VPC ID:',
        when: function(response) {
          return _this.options.createami && response.vpcid.length > 0;
        }
      }, {
        type: 'input',
        name: 'securitygroupids',
        message: 'Enter security group ids (comma separated) - required for non-default VPC ID:',
        when: function(response) {
          return _this.options.createami && response.vpcid.length > 0;
        }
      }];
      return _this.prompt(prompts).then(function(props) {
        for(var prop in props) {
          if (props.hasOwnProperty(prop)) {
            _this.options[prop] = props[prop];
          }
        }
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
      }.bind(_this));
    });
  },
  writing: function() {
    if (typeof this.props !== 'undefined' && typeof this.props.createami !== 'undefined') {
      if (!this.props.createami) return;
    }

    // var packerDictionary = {
    //   variables: {
    //     aws_access_key: "{{ env 'AWS_ACCESS_KEY_ID' }}",
    //     aws_secret_key: "{{ env 'AWS_SECRET_ACCESS_KEY' }}",
    //     instance_type: this.options.buildimagetype
    //   },
    //   builders: [],
    //   provisioners: []
    // };
    // packerDictionary.builders[0] = {};
    // packerDictionary.builders[0].type = "amazon-ebs";
    // packerDictionary.builders[0].access_key = "{{ user `aws_access_key` }}";
    // packerDictionary.builders[0].secret_key = "{{ user `aws_secret_key` }}";
    // packerDictionary.builders[0].ami_name = this.options.aminame || process.env.PROJECTNAME + ' {{timestamp}}';
    // packerDictionary.builders[0].instance_type = "{{ user `instance_type` }}";
    // packerDictionary.builders[0].region = this.option.primaryregion;
    // packerDictionary.builders[0].source_ami = this.options.regionspecificami;
    //
    // if (this.options.awsregions.length > 1) {
    //   packerDictionary.builders[0]['ami_regions'] = [];
    //   this.options.awsregions.forEach(function(element) {
    //     if (element != this.options.primaryregion) {
    //       packerDictionary.builders[0]['ami_regions'].push(element);
    //     }
    //   }.bind(this));
    // };
    // if (typeof this.options.amidescription !== 'undefined' && this.options.amidescription.length > 0) {
    //   packerDictionary.builders[0]['ami_description'] = this.options.amidescription;
    // };
    // if (typeof this.options.amigroups !== 'undefined' && this.options.amigroups.length > 0) {
    //   packerDictionary.builders[0]['ami_groups'] = this.options.amigroups.split(',');
    // };
    // if (typeof this.options.amiusers !== 'undefined' && this.options.amiusers.length > 0) {
    //   packerDictionary.builders[0]['ami_users'] = this.options.amiusers.split(',');
    // }
    // if (typeof this.options.vpcid !== 'undefined' && this.options.vpcid.length > 0) {
    //   packerDictionary.builders[0]['vpc_id'] = this.options.vpcid;
    // };
    // if (typeof this.options.subnetid !== 'undefined' && this.options.subnetid.length > 0) {
    //   packerDictionary.builders[0]['subnet_id'] = this.options.subnetid;
    // };
    // if (typeof this.options.securitygroupids !== 'undefined' && this.options.securitygroupids.length > 0) {
    //   buildpackerDictionary.builders[0]['security_group_ids'] = this.options.securitygroupids.split(',');
    // };
    // if (typeof this.options.iaminstanceprofile !== 'undefined' && this.options.iaminstanceprofile.length > 0) {
    //   packerDictionary.builders[0]['iam_instance_profile'] = this.options.iaminstanceprofile;
    // };

    // packerDictionary.provisioners[0] = {}
    // var osType = 'unix';
    // if (process.env.WINDOWSIMAGE || this.options.iswindows) {
    //   osType = 'windows';
    // };
    //
    // switch (process.env.CM_TYPE) {
    //   case 'chef':
    //     packerDictionary.provisioners[0]['type'] = 'chef-solo';
    //     packerDictionary.provisioners[0]['cookbook_paths'] = ['../'];
    //     packerDictionary.provisioners[0]['guest_os_type'] = osType;
    //     break;
    //   case 'puppet':
    //     packerDictionary.provisioners[0]['type'] = 'puppet-masterless';
    //     packerDictionary.provisioners[0]['manifest_file'] = 'manifests/';
    //     primarpackerDictionary.provisioners[0]['hiera_config_path'] = 'hiera.yaml';
    //     packerDictionary.provisioners[0]['module_paths'] = 'modules/';
    //     break;
    //   default:
    //     feedback.warn('CM Toolset ' + process.env.CM_TYPE + ' is not currently supported or available.');
    //     break;
    // }
    //
    // this.fs.writeJSON('packer.json', packerDictionary);

    // var packer_options = {
    //   instance_type: this.options.buildimagetype,
    //   primaryregion: this.options.primaryregion,
    //   regionspecificami: this.options.regionspecificami,
    //   buildimagetype: this.options.buildimagetype,
    // }

    // need to make it an extendJSON. read the block, put changes in, write.
    var bake_json = this.fs.readJSON(this.templatePath('packer.json'));
    console.log('bake_json-------------')
    console.log(bake_json);
    bake_json.builders[0].region = this.options.primaryregion;
    bake_json.builders[0].source_ami = this.options.regionspecificami;
    bake_json.builders[0].instance_type = this.options.buildimagetype;
    var bake_tpl = this.fs.extendJSON(this.destinationPath('packer.json'), bake_json);

    // write file
    // this.fs.copyTpl(
    //   this.templatePath('packer.json'),
    //   this.destinationPath('packer.json'),
    //   packer_options
    // )

  },


  default: {
    saveConfig: function() {
      _.forOwn(this.answers, function(value, key) {
        this.config.set(key, value);
      })
    }
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = BakeryBake;
