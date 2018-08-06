module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    postcss: {
      options: {
        processors: [
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        src: 'css/styles.min.css',
        dest: 'css/styles.min.css'
      }
    }
  });

  // Load the plugin that provides the "postcss" task.
  grunt.loadNpmTasks('grunt-postcss');

  // Default task(s).
  grunt.registerTask('default', ['postcss']);

};
