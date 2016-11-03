# generator-bakery [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> AWS Image Repo generator for building consistent AMI&#39;s

## Installation

First, install [Yeoman](http://yeoman.io) and generator-bakery using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-bakery
```

Then generate your new project:

```bash
yo bakery <project_name>
```

## Chef Users

* Check out the Packer provisioner details for [chef-solo](https://www.packer.io/docs/provisioners/chef-solo.html) if you want to extend the process provided out of the box.

## Puppet Users

* Check out the Packer provisioner details for [puppet-masterless](https://www.packer.io/docs/provisioners/puppet-masterless.html) if you want to extend the process provided out of the box.

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

ISC © [Datapipe](https://datapipe.com/)

[npm-image]: https://badge.fury.io/js/generator-imagebuild.svg
[npm-url]: https://npmjs.org/package/generator-imagebuild
[travis-image]: https://travis-ci.org/datapipe/generator-imagebuild.svg?branch=master
[travis-url]: https://travis-ci.org/datapipe/generator-imagebuild
[daviddm-image]: https://david-dm.org/datapipe/generator-imagebuild.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/datapipe/generator-imagebuild
