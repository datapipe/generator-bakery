# <%= project_name %>

This is a sample cookbook generated via the ```yo bakery``` [generator](https://github.com/datapipe/generator-bakery)

# setup

in order to get test kitchen to run, the following in your Gemfile.

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


# Building an image

Execute the ```./setup.sh``` script to build your image.
