# <%= project_name %>

This is a set of chef recipes, cookbooks and scripts designed to build an Amazon Machine Image. It was generated via  the [yeoman bakery generator](https://github.com/datapipe/k8s-debian-base).

# setup

In order to get test kitchen to run, use the following in your Gemfile.

```
source 'https://rubygems.org'

gem 'test-kitchen'
gem 'kitchen-vagrant'
gem 'ffi'
gem 'vagrant-berkshelf'
gem 'winrm'
gem 'winrm-fs'
gem 'kitchen-inspec'
gem 'berkshelf'
```

then execute `kitchen list` and `kitchen converge`

## Building the Image

The ```./build.sh``` script is set up to run the proper process locally to collect external cookbooks and then run the packer process to generate an image based on the ```packer.json``` definition.
