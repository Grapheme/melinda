module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    dirs:
      sources : "app"
      static  : "static"

    files :
      application : "<%= dirs.static %>/javascripts/app.js"

    concat: 
      dist:
        src : [ 
          "<%= dirs.sources %>/vendor/*.js" 
          "<%= dirs.sources %>/*.js"
        ]
        dest : "<%= files.application %>"

    uglify:
      options:
        banner :"""
                /* ---------------------------------------- 
                 * <%= pkg.name %> - v<%= pkg.version %> 
                 * <%= grunt.template.today("yyyy-mm-dd") %> 
                 * Grapheme team http://grapheme.ru
                 * ---------------------------------------- */ 

                """
        report : "min"

      dist:
        files:
          "<%= files.application %>" : [ "<%= files.application %>" ]

  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-uglify"

  grunt.registerTask "default", [ "concat", "uglify" ]
