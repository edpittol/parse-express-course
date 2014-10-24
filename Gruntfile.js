module.exports = function (grunt) {
  grunt.initConfig({
    // Create a express server
    develop: {
      server: {
        file: 'cloud/app.js'
      }
    },
    // Reload the server after an application server
    watch: {
      app: {
        files: [
          'cloud/app.js',
          'cloud/**/*.js',
          'cloud/config/global.json'
        ],
        tasks: ['develop'],
        options: { nospawn: true }
      }
    }
  });

  // Load the tasks
  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Create the default task
  grunt.registerTask('default', ['develop', 'watch']);
};
