/*
 * use pencil for black white world
 * @author hdg1988@gmail.com
 * @date 2013-05-07
 *
 */
define(function( require , exports , model ){

    // Detect canvas support
    var isSupportCanvas = (function(){
        return !!document.createElement('canvas').getContext('2d');
    })();

    // the target canvas element
    var can = null;
    var ctx = null;
    var canOff = null;
    // upload "world" picture
    var upload = function(){

    };

    // reset pencil path
    var reset = function(){

    };

    // save my work
    var save = function(){

    };

    // status of draw
    // 0 : not start
    var DRAW_NOT_START = 0;
    // 1 : is drawing
    var DRAW_ON_START = 1;
    // 2 : finished
    var DRAW_FINISHED = 2

    var dragStatus = 0;
    // save gray src image element
    var sketchCanvas = null;
    var originElement = null;
    var points = [];
    // events bind
    var bindEvents = function(){
        var stroke = function( points , bClosePath ){
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (var i = 0 , len = points.length ; i < len; i++ ) {
                // first one
                ctx [ i == 0 ? 'moveTo' : 'lineTo' ]( points[i].x , points[i].y );
            };

            if( bClosePath )
                ctx.closePath();
            ctx.stroke();
        };

        var getMidRandomPoint = function( p1 , p2 ){
            var rp = {};
            var xlen = Math.abs ( p1.x - p2.x );
            var ylen =  Math.abs ( p1.y - p2.y );
            var xmin = Math.min( p1.x , p2.x );
            var ymin = Math.min( p1.y , p2.y );
            var f =  20 * Math.pow( xlen + ylen , 0.86 ) / 100 + Math.random() * 15 - 10;
            if( xlen + ylen < 5 )  return null;
            // base to x
            if( xlen > ylen  ){
                rp.x = Math.random() * xlen * 0.8  + xlen * 0.1 + xmin;
                rp.y = Math.random() * f - f / 2 + p1.y - ( p1.x - rp.x ) * ( p2.y - p1.y ) / ( p2.x - p1.x );
            } else { // base to y
                rp.y = Math.random() * ylen * 0.8  + ylen * 0.1 + ymin;
                rp.x = Math.random() * f - f / 2 + p1.x - ( p1.y - rp.y ) * ( p2.x - p1.x ) / ( p2.y - p1.y );
            }
            return rp;
        };

        var buildPagerEdge = function( points ){
            var tmp = null;
            for (var len = points.length ,  i = len - 1 ; i >= 0 ; i--) {
                if( i == 0 ){
                    tmp = getMidRandomPoint( points[ i ] , points[ points.length - 1 ] );
                    if( tmp ){
                        points.unshift( tmp );
                    }
                } else {
                    tmp = getMidRandomPoint( points[ i ] , points[ i - 1 ] );
                    if( tmp ){
                        points.splice( i , 0 , tmp );
                    }
                }
            };

            if( len != points.length ){
                arguments.callee( points );
            }
        }
        // bind click event
        can.addEventListener( 'click' , function( ev ){

            if( dragStatus == DRAW_FINISHED || !sketchCanvas ) return;
            points.push(  {
                y : ev.clientY - canOff.top ,
                x: ev.clientX - canOff.left
            } );
            // change status
            dragStatus = DRAW_ON_START;
        } , false );

        // bind double click to finish drawing
        can.addEventListener( 'dblclick' , function( ev ){
            if( dragStatus != DRAW_ON_START  ) return;
            points.push(  {
                y : ev.clientY - canOff.top ,
                x: ev.clientX - canOff.left
            } );

            // filter points
            for (var i = points.length - 1; i >= 0; i--) {
                if( i > 0 ){
                    if( points[i].x == points[i-1].x &&
                        points[i].y == points[i-1].y )
                        points.splice( i - 1 , 1 );
                }
            };
            // change status
            dragStatus = DRAW_FINISHED;

            // build paper edge
            buildPagerEdge( points );
            // clear
            can.width = can.width;
            ctx.drawImage( originElement , 0 , 0 );
            // to close path
            stroke( points , true );

            ctx.fillStyle= ctx.createPattern( sketchCanvas ,'no-repeat');//by codeex.cn
            ctx.fill();

            // draw points
            /*
            ctx.fillStyle = '#f00';
            for (var i = points.length - 1; i >= 0; i--) {
                (function(p , i){
                    setTimeout( function(){
                        ctx.beginPath();
                        ctx.rect( points[i].x , points[i].y , 2 , 2 );
                        ctx.fill();
                    } , 100 * i );
                })( points[i] , i);
            };
            */
        } , false );

        // bind mousemove event
        can.addEventListener( 'mousemove' , function( ev ){
            if( dragStatus != DRAW_ON_START ) return;
            var movePoint = {
                y : ev.clientY - canOff.top ,
                x: ev.clientX - canOff.left
            };

            // fill canvas
            // clear
            can.width = can.width;
            ctx.drawImage( originElement , 0 , 0 );

            // build paper edge effect
            var tmpPoints = points.concat([movePoint]);
            // buildPagerEdge( tmpPoints );
            // stroke
            stroke( tmpPoints );

        } , false );
    }

    var sketchMod = require('../../examples/pencil_to_world/sketch');
    exports.render = function( dom ){
        if( !isSupportCanvas ) return;

        if( dom.tagName !== 'CANVAS' ) return;
        can = dom;
        var box = dom.getBoundingClientRect();
        canOff = {
            left: box.left,
            top: box.top
        }
        ctx = can.getContext('2d');

        bindEvents();
    };

    exports.drawImage = function( imgSrc ){
        // draw image
        originElement = document.createElement('img');
        originElement.onload = function(){
            can.width = this.width;
            can.height = this.height;
            ctx.drawImage( originElement , 0 , 0 );
            var imgData = ctx.getImageData(0,0,this.width,this.height);
            sketchMod.motionBlur( imgData , 180 , 0);
            ctx.putImageData( imgData  , 0 , 0 );
            return;
            // filter image
            sketchCanvas = can.cloneNode();
            var filterCtx = sketchCanvas.getContext('2d');
            filterCtx.drawImage( originElement , 0 , 0 );
            var imgData = filterCtx.getImageData(0,0,this.width,this.height);
            sketchMod.motionBlur(imgData);

            var min = 0;
            for (var i = 0 , len = imgData.data.length ; i < len; i+=4) {
                min = ( imgData.data[i] + imgData.data[i + 1] + imgData.data[i+2] ) / 3;
                min = ( Math.ceil( min / 32 ) ) * 32;
                imgData.data[i] = imgData.data[i + 1] = imgData.data[i+2] = min;
            }
            filterCtx.putImageData( imgData  , 0 , 0 );
        }

        originElement.src = imgSrc;
    }
});
/*
TODO :
    1.需要在两点的连线上，构造出纸张撕裂的效果
    2.在撕裂的效果上使用一小宽度的白边


*/