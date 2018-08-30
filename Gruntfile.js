module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    postcss: {
      options: {
        processors: [
          require('cssnano')() // minify the result
        ]
      },
      static_mappings: {
        files: {
          'css/styles.min.css': ['css/styles.css']
        }
      }
    },
    uglify: {
      static_mappings: {
        files: {
          'js/acm-1.0.1.min.js': 'js/acm-1.0.1.js'
        }
      }
    }
  });

  // Load the plugins that provide the "postcss" and "uglify" tasks.
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['postcss', 'uglify']);

};
