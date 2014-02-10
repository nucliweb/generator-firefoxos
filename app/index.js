'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');


var FirefoxOSGenerator = module.exports = function FirefoxOSGenerator(
  args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname,
                                                        '../package.json')));
};

util.inherits(FirefoxOSGenerator, yeoman.generators.NamedBase);

FirefoxOSGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);

  var prompts = [{
    name: 'appName',
    message: 'What do you want to call your app',
    default: 'My Firefox OS App'
  }, {
    name: 'appVersion',
    message: 'What is the current version of your app',
    default: '1.0.0'
  }, {
    name: 'devUserName',
    message: 'What is your Github username',
    default: 'rick-astley'
  }, {
    type: 'confirm',
    name: 'shallUseGaiaBB',
    message: 'Include Gaia\'s Building Blocks',
    default: true
  }, {
    type: 'confirm',
    name: 'shallUseFramework',
    message: 'Add Backbone + Require',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.appName = props.appName;
    this.appVersion = props.appVersion;
    this.devUserName = props.devUserName;
    this.shallUseGaiaBB = props.shallUseGaiaBB;
    this.shallUseFramework = props.shallUseFramework;

    cb();
  }.bind(this));
};

FirefoxOSGenerator.prototype._copyGaiaBB = function (dst) {
  var done = this.async();
  var _this = this;

  console.log('Gaia repository will now be downloaded.\nDepending on your ' +
              'connection, this will probably take a while.\n' +
              chalk.yellow('Don\'t panic!'));

  var bbSrc = 'https://github.com/buildingfirefoxos/' +
    'Building-Blocks/archive/gh-pages.tar.gz';

  this.tarball(bbSrc, '.tmp/bb/', function (err) {
    if (err) {
      console.log(chalk.red('Error fetching Gaia Building Blocks'));
    }
    else {
      var root = _this.sourceRoot();
      _this.sourceRoot(process.cwd());
      _this.directory('.tmp/bb/style', dst);
      _this.sourceRoot(root);
    }
    done();
  });
};

FirefoxOSGenerator.prototype._copyAppFramework = function () {
  // backbone + require
  this.mkdir('app/scripts/templates');
  this.mkdir('app/scripts/views');
  this.mkdir('app/scripts/models');
  this.mkdir('app/scripts/collections');
  this.copy('bower.json', 'bower.json');
  this.copy('app/scripts/main.js', 'app/scripts/main.js');
  this.copy('app/_index.html', 'app/index.html');
  this.copy('app/scripts/router.js', 'app/scripts/router.js');
  this.copy('app/scripts/views/hello.js', 'app/scripts/views/hello.js');
  this.copy('app/scripts/templates/hello.hbs',
            'app/scripts/templates/hello.hbs');

};

FirefoxOSGenerator.prototype.app = function app() {
  // app skeleton
  this.mkdir('app');
  this.mkdir('app/icons');
  this.mkdir('app/scripts');
  this.mkdir('app/scripts/vendor');
  this.mkdir('app/images');
  this.mkdir('app/styles');
  this.copy('app/_manifest.webapp', 'app/manifest.webapp');
  this.copy('app/icons/120x120.png', 'app/icons/120x120.png');
  this.copy('app/icons/128x128.png', 'app/icons/128x128.png');
  this.copy('app/icons/60x60.png', 'app/icons/60x60.png');
  this.copy('app/styles/_main.sass', 'app/styles/main.sass');
  if (!this.shallUseFramework) {
    this.copy('app/scripts/main_simple.js', 'app/scripts/main.js');
    this.copy('app/_index_simple.html', 'app/index.html');
  }

  // test framework
  this.mkdir('test');
  this.mkdir('test/lib');
  this.mkdir('test/spec');
  this.copy('test/lib/mocha.js', 'test/lib/mocha.js');
  this.copy('test/lib/mocha.css', 'test/lib/mocha.css');
  this.copy('test/lib/sinon.js', 'test/lib/sinon.js');
  this.copy('test/lib/chai.js', 'test/lib/chai.js');
  fs.symlinkSync('../app/scripts',
                 'test/scripts',
                 'dir');
  if (this.shallUseFramework) {
    this.copy('test/main.js', 'test/main.js');
    this.copy('test/_index.html', 'test/index.html');
    this.copy('test/spec/sample.js', 'test/spec/sample.js');
    fs.symlinkSync('../app/components',
                   'test/components',
                   'dir');
  }
  else {
    this.copy('test/_index_simple.html', 'test/index.html');
  }

  if (this.shallUseFramework) {
    this._copyAppFramework();
  }
  //
  // copy gaia's BB
  if (this.shallUseGaiaBB) {
    this.mkdir('app/styles/gaiabb');
    this._copyGaiaBB('app/styles/gaiabb');
  }
};

FirefoxOSGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('_package.json', 'package.json');
  this.copy('_Gruntfile.js', 'Gruntfile.js');
  this.copy('jshintrc', '.jshintrc');
  this.copy('_README.md', 'README.md');
  this.copy('bowerrc', '.bowerrc');
};

