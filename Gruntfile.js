'use strict';

module.exports = function (grunt) {
  [
    'grunt-contrib-watch',
    'grunt-contrib-copy',
    'grunt-contrib-clean'
  ].forEach(grunt.loadNpmTasks);

  var templateVars = {
    appName: 'Waka waka',
    devUserName: 'darth-vader',
    shallUseGaiaBB: true
  };

  grunt.initConfig({
    copy: {
      all: {
        files: {
          'app/templates/Gruntfile.js': 'app/templates/_Gruntfile.js',
          'app/templates/README.md': 'app/templates/_README.md',
          'app/templates/app/index.html': 'app/templates/app/_index.html',
          'app/templates/.jshintrc': 'app/templates/jshintrc'
        },
        options: {
          processContent: function (content) {
            return grunt.template.process(content, {
              data: templateVars
            });
          }
        }
      }
    },

    clean: {
      all: ['app/templates/Gruntfile.js',
            'app/templates/README.md',
            'app/templates/app/index.html',
            'app/templates/.jshintrc']
    },

    watch: {
      all: {
        files: ['app/templates/**/_*'],
        tasks: ['copy:all']
      }
    }
  });

  grunt.registerTask('default', ['clean:all', 'copy:all', 'watch']);
  grunt.registerTask('compile', 'copy:all');
}
