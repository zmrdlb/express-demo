module.exports = function(grunt) {
	grunt.file.setBase(__dirname);
    var packdir = '../tool/'; //package.json所在的目录
    var npmdir = '../tool/node_modules/'; //npm模块路径

	//压缩后的代码目录
	var _product_dir = '../dist/express-demo';
	var version = Date.now();

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: {
               transform: [
					["babelify"],
					["stringify", {
						appliesTo: { includeExtensions: ['.html'] },
        				minify: true
					}]
               ],
			   external: [] //jquery作为外部引用
            },
			//开发环境
            develop: {
				options: {
					watch: true,
                    keepAlive: true,
					browserifyOptions: {
	 				   debug: true
	 			    }
				},
                expand: true,
                cwd: './public/javascripts/page',
                src: ['**/*.js'],
                dest: './public/javascripts/bundle'
            },
			//生产环境
			product: {
                expand: true,
                cwd: './public/javascripts/page',
                src: ['**/*.js'],
                dest: _product_dir+'/public/javascripts/bundle'
			}
			//单个文件测试
			// single: {
            //     src: './public/javascripts/page/iofetch/index.js',
            //     dest: './public/javascripts/bundle/iofetch/index.js'
			// }
       },
	   //压缩
	   uglify: {
		   options: {
			   report: 'gzip'
		   },
		   apps: {
			   cwd: _product_dir+'/public/javascripts/bundle',
			   src: ['**/*.js'],
			   dest: _product_dir+'/public/javascripts/bundle',
			   expand: true,
			   ext: '.js'
		   }
	   },
	   //文件复制
	   copy: {
		   apps: {
			   expand: true,
			   cwd: '.',
			   src: ['bin/**','public/images/**','routes/**','views/**','.babelrc','.gitignore','app.js','package.json'],
			   dest: _product_dir
		   }
	   },
	   //coreui css打包压缩
	   cssmin: {
			minify: {
				expand: true,
				cwd: './public/stylesheets/page',
				src: ['*.css'],
				dest: _product_dir+'/public/stylesheets/page'
			}
	   },
	   //版本号替换
	   replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: version
                        }
                    ]
                },
                expand: true,
                cwd: _product_dir + '/views',
                src: ['**/*.ejs'],
                dest: _product_dir + '/views'

           }
	   },
	   clean: {
		    options: {
		        force: true
		    },
            dist: [_product_dir+"/*","!"+_product_dir+"/.git"]
        }
	});

	grunt.loadTasks(npmdir+"grunt-browserify/tasks");
	grunt.loadTasks(npmdir+'grunt-contrib-uglify/tasks');
	grunt.loadTasks(npmdir+'grunt-contrib-copy/tasks');
	grunt.loadTasks(npmdir+'grunt-replace/tasks');
	grunt.loadTasks(npmdir+'grunt-contrib-cssmin/tasks');
    grunt.loadTasks(npmdir+'grunt-contrib-clean/tasks');

	//grunt single -v --base=D:\mycoderoot\project-frame\tool\node_modules
	// grunt.registerTask('single', ['browserify:single']);

	//grunt develop -v --base=D:\mycoderoot\project-frame\tool\node_modules
	grunt.registerTask('develop', ['browserify:develop']);

	//grunt -v --base=D:\mycoderoot\project-frame\tool\node_modules
	grunt.registerTask('default', ['clean:dist','copy','browserify:product','uglify','cssmin','replace']);

};
