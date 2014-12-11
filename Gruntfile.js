/* global module, require */
/* jshint strict: false */
module.exports = function (grunt) {

    // Load grunt tasks automatically
	require('load-grunt-tasks')(grunt, {pattern: ['grunt-*','!grunt-lib-phantomjs']});
	grunt.loadTasks('gruntTasks');

	var aJS = [
		'src/js/widdio.js'
	];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')

		// watchers
		,watch: {
			gruntfile: {
				files: ['Gruntfile.js', '.jshintrc'],
				//tasks: ['beep:2'],ehr
				options: { spawn: false, reload: true }
			}
			,js: {
				files: ['src/js/*.js'],
				tasks: ['js'],
				options: { spawn: false }
			}
			,less: {
				files: ['src/style/*.less']
				,tasks: ['css']
				,options: { spawn: false }
			}
			/*jsdoc: {
				files: [
					'jsdoc/template/static/styles.less'
					,'jsdoc/template/tmpl.tmpl'
					,'jsdoc/tutorials*'
					,'jsdoc.md'
				]
				,tasks: ['jsdoc']
				,options: { spawn: false }
			},
			template: {
				files: ['src/widget.html','style/main.css']
				,tasks: ['updateTemplate']
				,options: { spawn: false }
			},*/
			,revision: {
				files: ['.git/COMMIT_EDITMSG']
				,tasks: ['revision']
				,options: { spawn: false }
			}
		}

		// command line interface
		,cli: {
			jsdoc: { cwd: './', command: 'jsdoc -c jsdoc.json', output: true }
			,jsdocprepare: { cwd: './jsdoc', command: 'grunt prepare', output: true }
		}

		// update revision
		,version_git: {
			main: {
				files: {src:aJS[0]}
			}
		}

		// js-hint
		,jshint: {
			options: { jshintrc: '.jshintrc' },
			files: aJS
		}

		,jscs: {
			src: aJS
			,options: {
				config: ".jscsrc"
				,requireCurlyBraces: [ "if" ]
			}
		}

		// clean
		,clean: {
			dist: {
				src: ['dist/**']
			}
			,jsdoc: {
				src: ['doc/**']
			}
		}

		// uses Phantomjs to render pages and inject a js file
		,renderPages: {
			template: {
				baseUri: 'http://localhost.sk123ow/'
				,dest: './temp/stripped/'
				,pages: ['widget.html'] // todo: change to {"dest":src} style
				,inject: 'src-dev/js/phantomStripWidget.js'
				,renderImage: false
			}
			,docs: {
				baseUri: 'http://localhost.sk123ow.docs/'
				,dest: './temp/'
				,destType: 'json'
				,pages: ['sk123ow.html']
				,inject: 'src-dev/js/phantomRenderDocs.js'
				,renderImage: false
			}
		}

		,svgIcons: {
		  main: {
			src: 'src/icons/IcoMoon - 13 Icons.zip',
			dest: 'src/style/svgIcons.less'
		  }
		}
		,icomoon: {
			updatefont: {
				src: 'src/icons/widdio.zip'
				,dest: 'src/style/iconfont.less'
				,destFonts: 'src/style/fonts/'
			}
		}

		/*,extendDocs: {
			main: {
				src: './doc/index.html'
				,dest: './doc/index.html'
				,json: './temp/sk123ow.json'
			}
		}*/

		// copy all the stuff
		/*,copy: {
			jsdoc: {
				files: [
					{
						expand: true
						,cwd: 'dist/'
						,src: ['*']
						,dest: 'doc/scripts/'
						,filter: 'isFile'
						,dot: true
					}
				]
			}
		}*/

		// concatenate and minify
		,uglify: {
			dist: {
				options: {
				  banner: ''
				}
				,src: aJS
				,dest: 'dist/widdio.min.js'
			}
		}

		// compile less
		,less: {
			options: {
				compress: true
			}
			,src: {
				src: ['src/style/main.less'],
				dest: 'src/style/main.css'
			}
		}

		// map source js jsdoc variables to json variables
		,map_json: {
			package: {
				src: aJS[0]
				,dest: 'package.json'
				,map: {
					title:'summary'
				}
			}
			,jsdoc : {
				src: aJS[0]
				,dest: 'jsdoc.json'
				,map: {
					summary:'templates.systemName'
					,copyright:'templates.copyright'
					,author:'templates.author'
				}
			}
		}

	});

	grunt.registerTask('default',['watch']);
	grunt.registerTask('css',[
		'less'
	]);
	grunt.registerTask('js',[
		'jshint'
		,'uglify:dist'
	]);
	grunt.registerTask('revision',[
		'version_git'
		,'map_json'
	]);
	grunt.registerTask('dist',[
		'css'
		,'js'
	]);
	grunt.registerTask('jsdoc',[
		'clean:jsdoc'
		,'cli:jsdocprepare'
		,'cli:jsdoc'
		,'copy:jsdoc'
		,'renderPages:docs'
		,'extendDocs'
	]);

};