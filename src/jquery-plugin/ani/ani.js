/*
 * jquery plugin for anination
 *
 */
!(function( $ ){
    var attrName = 'jq-effect';
    var toJson = function(s){
            if(!s) return {};
            var arr = s.split(';') , result = {} , temp;
            for (var i = 0 , len = arr.length ; i<len;i++){
                temp = arr[i].split(':');
                result[temp[0]] = temp[1];
            }
            return result;
        }
    var effectHook = {
        'fadeUp' : function( pos ){
            return {
                opacity: 0,
                top : pos.top + pos.height
            }
        },
        "fadeLeft" : function( pos ){
            return {
                opacity: 0,
                left: pos.left + pos.width
            }
        },
        "fadeDown" : function( pos ){
            return {
                opacity: 0,
                top: pos.top - pos.height
            }
        },
        "fadeRight" : function( pos ){
            return {
                opacity: 0,
                left: pos.left - pos.width
            }
        }
    };
    var initEffect = function( $dom ) {
        var cfg = toJson( $dom.attr( attrName ) );

        var timer = setTimeout( function(){

            var pos = $dom.show().offset();
            $.extend( pos , {
                width : $dom.width(),
                height : $dom.height()
            } , true );

            // prepare animate config
            if( cfg.effect && effectHook[cfg.effect] ) {
                cfg.start = effectHook[cfg.effect]( pos );
            } else if ( cfg.start ) {
                var tmp = cfg.start.split(',');
                cfg.start = {
                    left: parseInt( tmp[ 0 ] ),
                    top : parseInt( tmp[ 1 ] )
                }
            }
            // run animate
            $dom.css( cfg.start || { opacity: 0 } );
            $.extend( pos , { opacity:1 } , true );
            $dom.animate( pos , parseInt( cfg.duration ) || 500 , cfg.easing );
        } , cfg.delay || 0 );
    }
    $.fn.effect = function(){

        $(this).each(function(){
            initEffect( $( this ) );
        });

        return this;
    }
})( window.jQuery );