# sample_cookbook

This is a sample cookbook generated via the chef command line interface for version 0.18.30

# setup

in order to get test kitchen to run I use the following in my Gemfile.

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
