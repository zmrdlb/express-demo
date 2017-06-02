module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
        "name"        : "express-demo",
        "script"      : "./express-demo/app.js",
        /**
         * 给当前应用程序的参数
         * 在app.js中打印process.argv
         *[ 'C:\\Program Files\\nodejs\\node.exe',
         * 'C:\\Users\\mingrui\\AppData\\Roaming\\npm\\node_modules\\pm2\\lib\\ProcessContainerFork.js',
         * '--toto=heya coco',
         * '-d',
         * '1' ]
         * 另外一种写法："--toto='heya coco' -d 1"
         */
        "args"        : ["--toto=heya coco", "-d", "1"],
        "watch"       : true,
        /**
         * 给node的参数
         */
        "node_args"   : "--harmony",
        "merge_logs"  : true,
        /**
         * 应用程序所在目录
         */
        "cwd": "./express-demo",
        /**
         * 在app.js中执行app.get('env')
         * 打印出指定的NODE_ENV
         */
        "env": {
          "NODE_ENV": "production",
          "AWESOME_SERVICE_API_TOKEN": "xxx",
          "REMOTE_ADDR": "http://web.zmrdlb.com/"
        },
        "env_development" : {
           "NODE_ENV": "development"
        },
        "env_staging" : {
           "NODE_ENV" : "staging",
           "TEST"     : true
        }
    },

    // 配置说明
    {
        /**一般配置**/

        // "name"       : "api-app",
        // "script"     : "api.js",
        // "cwd": "/path",
        // "args": [],
        // 解释器绝对路径。默认是node
        // "interpreter": "/usr/bin/python",
        /**
         * 应用解释器。默认是node, 也可以是python,ruby,bash等。none将应用程序作为二进制文件执行
         */
        // "exec_interpreter": "node",
        // 解释器参数
        // "interpreter_args": [],
        // interpreter_args的别名
        // "node_args": [],

        /**高级配置**/

        /**
         * 集群app(clustered app)实例个数。
         * 0: 意味着你拥有CUP内核的多个实例
         * 负值：意味着CPU内核数+对应值。如-1, 且当前有4个内核，那么将会有3个实例
         */
        // "instances"  : 4,
        /**
         * 默认是fork模式，cluster模式和instances字段一起配置
         */
        // "exec_mode"  : "cluster",
        /**
         * 默认是false.
         * true: 当app里面的文件一旦改变，则重新启动app
         */
        // "watch": true,
        /**
         * 启动watch时，忽略的监听的文件的正则列表
         */
        // "ignore_watch": ["[\/\\]\./", "node_modules"],
        /**
         * 如果超过指定的内存，app将会被重启
         * “10M”, “100K”, “2G”, 1024: 1024 bytes
         */
        // "max_memory_restart": "150M",
        // 环境配置
        // "env[_xxx]": {},
        /**
         * 默认是true。当抛出异常时，启用或禁止source map file支持
         */
        // "source_map_support": true,

        /**log文件**/

        /**
         * 显示在logs中的时间戳的格式化
         */
        // "log_date_format": "YYYY-MM-DD HH:mm Z",
        /**
         * 错误日志文件路径。默认不用指定，pm2会自己生成
         */
        // "error_file" : "./examples/child-err.log",
        /**
         * 输出日志output log文件路径。如代码里面打印的console.log
         * 默认不用指定，pm2会自己生成
         */
        // "out_file"   : "./examples/child-out.log",
        /**
         * 默认是false
         * true: 把同一个app的所有实例instances的log合并到同一个文件里
         */
        // "merge_logs|combine_logs": false,
        /**
         * pid文件路径。默认不用指定，pm2会自己生成
         */
        // "pid_file"   : "./examples/child.pid",

        /**控制流配置**/
        /**
         * app最小运行时间。即，如果app在指定时间内退出，pm2会认为app异常，此时会触发重启max_restarts设置
         * Number: 1000：1000毫秒；
         * String: 1h 5m 10s
         */
        // "min_uptime": 1000,
        // time in ms before forcing a reload if app not listening
        // "listen_timeout": 8000,
        // time in milliseconds before sending a final SIGKILL
        // "kill_timeout": 1600,
        // Instead of reload waiting for listen event, wait for process.send(‘ready’)
        // "wait_ready": false,
        /**
         * 当app发生错误或停止时，连续不稳定重启数。默认是15
         */
        // "max_restarts": 10,
        /**
         * 默认是0.
         * 当app崩溃，重启之前等待的时间（毫秒）
         */
        // "restart_delay": 4000,
        /**
         * 默认是true.
         * false: 如果app崩溃或其他，pm2将不会重启app
         */
        // "autorestart": false,
        /**
         * 一个cron pattern去重新启动app。仅仅在mode是cluster下剩下。后面会在fork模式下也运行
         */
        // "cron_restart": "1 0 * * *",
        /**
         * 默认是true
         * false: PM2 will start without vizion features (versioning control metadatas)
         */
        // "vizion": false,
        /**
         * 当你在Keymetrics dashboard执行了Pull/Upgrade操作后，将会执行下面的命令
         */
        // "post_update": ["npm install", "echo launching the app"],
        /**
         * 默认是false
         * true: 可以通过pm2启动相同的脚本几次（通常是不被允许的）
         */
        // "force": true,
        /**
         * 默认是false
         * true: pm2会启动你的app通过嵌入式babeljs特性，这意味着你可以使用es6,es7特性
         */
        // "next_gen_js": true

    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
