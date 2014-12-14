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
			,parse: {
				files: ['src/style/widdio.less']
				,tasks: ['parseCSS','js']
				,options: { spawn: false }
			}
			,less: {
				files: ['src/style/widdio.less']
				,tasks: ['less']
				,options: { spawn: false }
			}
			,icons: {
				files: ['src/icons/IcoMoon - 13 Icons.zip']
				,tasks: ['parseIcons','js']
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

		//########################

		// update revision
		,version_git: {
			main: {
				files: {src:aJS[0]}
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

		//########################

		// clean
		,clean: {
			dist: { src: ['dist/**'] }
			,jsdoc: { src: ['doc/**'] }
		}

		// compile less
		,less: {
//			main: {
//				options: { compress: true }
//				,src: {
//					src: ['src/style/main.less'],
//					dest: 'src/style/main.css'
//				}
//			}
//			,widdio: {
				options: { compress: true }
				,src: {
					src: ['src/style/widdio.less'],
					dest: 'src/style/widdio.css'
				}
//			}
		}

		// get icons
		,svgIcons: {
		  main: {
			src: 'src/icons/IcoMoon - 13 Icons.zip'
			,dest: 'temp/svgIcons.json'
			//,contents:
			// /<path.*path>/
			,contents: /<path\sd="([^"]+)"/
			//dest: 'src/style/svgIcons.less'
		  }
		}

		// insert variables into js
		,insert_vars: {
			svgIcons: {
				file: aJS[0]
				,replace: {
					'oSVGIcons': ['temp/svgIcons.json']
				}
			}
			,css: {
				file: aJS[0]
				,toString: true
				,replace: {
					'sCSS': ['src/style/widdio.css']
				}
			}
		}

		// js-hint
		,jshint: {
			options: { jshintrc: '.jshintrc' },
			files: aJS
		}

		// concatenate and minify
		,uglify: {
			dist: {
				options: { banner: '' }
				,src: aJS
				,dest: 'dist/widdio.min.js'
			}
		}

		// uses Phantomjs to render pages and inject a js file
		/*,renderPages: {
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
		}*/

		/*,icomoon: {
			updatefont: {
				src: 'src/icons/widdio.zip'
				,dest: 'src/style/iconfont.less'
				,destFonts: 'src/style/fonts/'
			}
		}*/

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

		//########################
		,jscs: {
			src: aJS
			,options: {
				config: ".jscsrc"
				,requireCurlyBraces: [ "if" ]
			}
		}
		//########################

	});

	grunt.registerTask('default',['watch']);

	grunt.registerTask('js',[
		'jshint'
		,'uglify:dist'
	]);

	grunt.registerTask('parse',[
		'parseIcons'
		,'parseCSS'
	]);
	grunt.registerTask('parseIcons',[
		'svgIcons'
		,'insert_vars:svgIcons'
	]);
	grunt.registerTask('parseCSS',[
		'less'
		,'insert_vars:css'
	]);

	grunt.registerTask('dist',[
		'parse'
		,'js'
	]);

	//

	grunt.registerTask('revision',[
		'version_git'
		,'map_json'
	]);

	//

	grunt.registerTask('jsdoc',[
		'clean:jsdoc'
		,'cli:jsdocprepare'
		,'cli:jsdoc'
		,'copy:jsdoc'
		,'renderPages:docs'
		,'extendDocs'
	]);

};