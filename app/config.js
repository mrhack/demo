seajs.config({
  // 加载 shim 插件
  plugins: ['shim'],
  // 配置 shim 信息，这样我们就可以通过 require('jquery') 来获取 jQuery
  shim: {
    // for jquery
    'jquery': {
        src: '../jquery/jquery-1.8.3.min',
        exports: 'jQuery'
    }
    ,'jquery.easing' : {
        src: '../../src/jquery-plugin/easing/jquery.easing.1.3',
        deps: ['jquery']
    }
    ,'jquery.ani' : {
        src: '../../src/jquery-plugin/ani/ani',
        deps: ['jquery.easing']
    }

    // for raphael
    ,'raphael': {
        src: '../raphael/raphael',
        exports: 'Raphael'
    }

    // for bootstrap
    ,'bootstrap': {
        src: '../raphael/raphael-min'
    }
  },
  alias : {
    'util' : '../src/util/util'
  }
});