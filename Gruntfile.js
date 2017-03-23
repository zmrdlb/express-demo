module.exports = function(grunt) {
	grunt.file.setBase(__dirname);
    var packdir = '../tool/'; //package.json所在的目录
    var npmdir = '../tool/node_modules/'; //npm模块路径

	//压缩后的代码目录
	var _product_dir = '../dist/express-demo';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: {
               transform: [
                	["babelify"]
               ],
			   external: ['jquery'] //jquery作为外部引用
            },
			//开发环境
            develop: {
				options: {
					// watch: true,
                    // keepAlive: true,
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
			   flatten: true,
			   ext: '.js'
		   }
	   },
	   //文件复制
	   copy: {
		   html: {
			   expand: true,
			   src: '*.html',
			   dest: _product_dir
		   }
	   }
	});

	grunt.loadTasks(npmdir+"grunt-browserify/tasks");
	grunt.loadTasks(npmdir+'grunt-contrib-uglify/tasks');
	grunt.loadTasks(npmdir+'grunt-contrib-copy/tasks');

	//grunt develop -v --base=D:\mycoderoot\project-frame\tool\node_modules
	grunt.registerTask('develop', ['browserify:develop']);

	//grunt -v
	grunt.registerTask('default', ['browserify:product','uglify','copy']);

};
