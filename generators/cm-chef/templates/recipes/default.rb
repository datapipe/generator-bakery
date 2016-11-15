#
# Cookbook Name:: <%= project_name %>
# Recipe:: default
#
# Copyright (c) <%= year %> <%= author_name %>, All Rights Reserved.

include_recipe 'apt'
include_recipe 'nginx'

directory '/var/www/nginx-default' do
  owner 'www-data'
  group 'www-data'
  mode '0755'
  recursive true
  action :create
end

file '/var/www/nginx-default/index.html' do
  owner 'www-data'
  group 'www-data'
  mode '0755'
  content 'Hello World from Packer!'
  action :create
end
