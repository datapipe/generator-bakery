'use strict';
const yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    bakery = require('../../lib/bakery');

const AWS_REGIONS = [{
    name: 'us-east-1'
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

        this.option('citype', {
            desc: 'Specify the CI Toolset to be used',
            type: String,
            alias: 't'
        });

        this.option('projectname', {
            desc: 'Name of the project being created',
            type: String,
            alias: 'n'
        });
    },

    prompting: function() {
        this.log(bakery.banner('Bakery Setup!'));

        var prompts = [{
            type: "confirm",
            name: "createami",
            message: "Create Amazon Machine Image?",
            default: true
        }, {
            type: 'input',
            name: 'aminame',
            message: 'Name for this AMI:',
            default: function () {
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
                if (response.length < 1) {
                    return 'You must choose at least one AWS Region.';
                }
                return true;
            }
        }, {
            type: 'list',
            name: 'primaryregion',
            message: 'Choose a primary region for building in AWS:',
            when: function(response) {
                return (response.awsregions.length > 1);
            },
            choices: function(response) {
                return response.awsregions;
            },
            default: function (response) {
                if (response.awsregions.indexOf('us-west-2') > -1) {
                  return 'us-west-2';
                }
                else {
                  return response.awsregions[0];
                }
            }
        }, {
            type: 'list',
            name: 'buildimagetype',
            message: 'Instance Type for build:',
            default: 't2.large',
            choices: AWS_INSTANCE_TYPES,
            when: function(response) {
                return response.createami;
            }
        }, {
            type: 'confirm',
            name: 'iswindows',
            message: 'Is this a Windows-based image:',
            default: false,
            when: function(response) {
                return response.createami;
            }
        }, {
            type: 'input',
            name: 'regionspecificami',
            message: function(response) {
              return 'AMI ID in ' + response.primaryregion + ' region:';
            },
            when: function(response) {
                return response.createami && response.primaryregion.length > 0;
            }
        }, {
            type: 'input',
            name: 'amigroups',
            message: 'Enter a list (comma separated) of groups to share this AMI with:',
            when: function(response) {
              return response.createami;
            }
        }, {
            type: 'input',
            name: 'amiusers',
            message: 'Enter a list of (comma separated) account id\'s to share this AMI with:',
            when: function(response) {
              return response.createami;
            }
        }, {
            type: 'input',
            name: 'iaminstanceprofile',
            message: 'Enter the IAM instance profile id you want to apply to instances while they are being built:',
            when: function(response) {
              return response.createami;
            }
        }, {
            type: 'input',
            name: 'vpcid',
            message: 'Enter VPC ID, leave blank for default VPC:',
            when: function(response) {
                return response.createami;
            }
        }, {
            type: 'input',
            name: 'subnetid',
            message: 'Enter subnet id - Required for non-default VPC ID:',
            when: function(response) {
                return response.createami && response.vpcid.length > 0;
            }
        }, {
            type: 'input',
            name: 'securitygroupids',
            message: 'Enter security group ids (comma separated) - required for non-default VPC ID:',
            when: function(response) {
                return response.createami && response.vpcid.length > 0;
            }
        }];

        return this.prompt(prompts).then(function(props) {
          this.props = props;
          switch (process.env.CI_TYPE) {
              case 'drone':
                  //do something
                  break;
              case 'jenkins':
                  //do something
                  break;
              default:
                  this.log.error('CI toolset ' + this.options.citype + ' is not currently available. Skipping CI script setup');
                  break;
          }
        }.bind(this));
    },

    writing: function() {
        var primaryBuilder = {
            ami_name: this.props.aminame || process.env.PROJECTNAME + ' {{timestamp}}',
            instance_type: this.props.buildimagetype,
            region: this.props.primaryregion,
            source_amp: this.props.regionspecificami
        };
        if (this.props.awsregions.length > 1) {
            primaryBuilder['ami_regions'] = this.props.awsregions.splice(this.props.awsregions.indexOf(this.props.primaryregion), 1);
        };
        if (typeof this.props.amidescription !== 'undefined' && this.props.amidescription.length > 0) {
            primaryBuilder['ami_description'] = this.props.amidescription;
        };
        if (typeof this.props.amigroups !== 'undefined' && this.props.amigroups.length > 0) {
            primaryBuilder['ami_groups'] = this.props.amigroups.split(',');
        };
        if (typeof this.props.amiusers !== 'undefined' && this.props.amiusers.length > 0) {
            primaryBuilder['ami_users'] = this.props.amiusers.split(',');
        }
        if (typeof this.props.vpcid !== 'undefined' && this.props.vpcid.length > 0) {
            primaryBuilder['vpc_id'] = this.props.vpcid;
        };
        if (typeof this.props.subnetid !== 'undefined' && this.props.subnetid.length > 0) {
            primaryBuilder['subnet_id'] = this.props.subnetid;
        };
        if (typeof this.props.securitygroupids !== 'undefined' && this.props.securitygroupids.length > 0) {
            primaryBuilder['security_group_ids'] = this.props.securitygroupids.split(',');
        };
        if (typeof this.props.iaminstanceprofile !== 'undefined' && this.props.iaminstanceprofile.length > 0) {
            primaryBuilder['iam_instance_profile'] = this.props.iaminstanceprofile;
        };

        var osType = 'unix';
        if (this.props.iswindows) {
          osType = 'windows';
        };

        var primaryProvisioner = {};

        switch (process.env.CM_TYPE) {
            case 'chef':
              primaryProvisioner['type'] = 'chef-solo';
              primaryProvisioner['cookbook_paths'] = ['../'];
              primaryProvisioner['guest_os_type'] = osType;
              break;
            case 'puppet':
              primaryProvisioner['type'] = 'puppet-masterless';
              primaryProvisioner['manifest_file'] = 'manifests/';
              primaryProvisioner['hiera_config_path'] = 'hiera/';
              primaryProvisioner['module_paths'] = 'modules/';
              break;
            default:
              this.log.error('CM Toolset ' + process.env.CM_TYPE + ' is not currently supported or available.');
              break;
        }

        var packerDictionary = {primaryBuilder, primaryProvisioner};

        this.fs.writeJSON('packer.json', packerDictionary);
    },

    install: function() {
        this.installDependencies();
    }
});

module.exports = BakeryBake;
