/*
 * 烟花
 */
define(function( require , exports , model ){
	var $ = require('jquery');
    var random = Math.random,
		sin = Math.sin,
		cos = Math.cos,
		floor = Math.floor,
		PI = Math.PI,
		getRandomColor = function(){
			return 'rgba(' + floor(random()*256) + ',' + floor(random()*256) + ',' + floor(random()*256) + ',1 )';
		},
		SCALE = 10,
        N = 1,
        M = 3,
        G = 0.05,
		F = 0.99,
		MAX_NUM = 500,
		CAN_WIDTH = 500,
		CAN_HEIGHT = 500,
	    pieces = [],
		CTX = null,
		mix = function(r, s, ov) {
			for (var i in s){ 
                if (s.hasOwnProperty(i) && (ov || !(i in r))){
                    r[i] = s[i];
                }
            }
            return r;
		},
		play = (function(){
			var tempCan = $('<canvas></canvas>').attr('width',CAN_WIDTH).attr('height',CAN_HEIGHT).get(0),
				tempCtx = tempCan.getContext('2d'),
				fpstime = new Date(),
				fpscount= 0,
				cTime;
			setInterval(function(){
					cTime = new Date();
					fpscount++;
					var duration = 200;
					if( cTime - fpstime > duration ){
						$('#fps').html( 'fps : ' +  fpscount * 1000 / duration ); 
						fpstime = cTime;
						fpscount = 0;
					}
					
					if(!CTX) return;
					CTX.fillStyle = "rgba(0 , 0 , 0 , .4)";
					CTX.fillRect(0 ,0, CAN_WIDTH ,CAN_HEIGHT);
					tempCtx.clearRect(0 , 0 , CAN_WIDTH ,CAN_HEIGHT);
					var t = new Date()/1000;
					pieces.sort(function(a , b ){
						return a.zDis < b.zDis;
					});
					for (var i = pieces.length - 1; i >= 0 ; i--){
						var pie = pieces[i] ,  o = pie.config;
						pie.config.energy *= 0.92;
						if(pie.config.energy <0.4){
							pieces.splice(i , 1);
							if(o.onhide)
								o.onhide(pie);
						}
						pie.draw(t , tempCtx);
					}
					CTX.drawImage(tempCan , 0, 0);
                } , 10);
		})(),
        Piece = function( cf ){
        	this.config = {
                speed: 500 , // 初始速度是多少
                theta: PI/3, // 在xy平面投影与x夹角 (x向右，y向下，z向外)
                eleva: PI/10, //仰角 与xy平面夹角 ,
                time: 2, // 多少时间会消灭
				z: 0,
				x: 0,
				y: 0
            };
            $.extend(this.config , cf );
            var t = this , o =t.config ;
            t.ySpeed = o.speed * cos(o.eleva)*sin(o.theta);
            t.zSpeed = o.speed * sin(o.eleva);
            t.xSpeed = o.speed * cos(o.eleva) * cos(o.theta);
			t.enAngle = t.xSpeed<0 ? PI : 0;
			t.xDis = o.x;
			t.zDis = o.z;
			t.yDis = o.y;

			this.draw = function(time , ctx){
                // 先只有一个点
                var t = this , o = t.config;
                t.xSpeed *= F;
				//t.zSpeed *= F;
				t.ySpeed += G;
                time = time - o.t;

				t.xDis += t.xSpeed;
				t.zDis = t.zSpeed*time;
				t.yDis += t.ySpeed;
                var currPoint = [t.xDis , t.yDis , t.zDis];
                
                var r = Math.abs(N + (M - N)*(t.zDis/Math.abs(2*o.time*o.speed) + 1/2));
				var angle = Math.atan((t.ySpeed + G*time)/t.xSpeed) + t.enAngle,
					ax = r*Math.cos(angle),
					ay = r*Math.sin(angle);
				var gradient = ctx.createRadialGradient(Math.floor(currPoint[0] + ax),Math.floor(currPoint[1] + ay),0,currPoint[0],currPoint[1],r);
                gradient.addColorStop(0.3,'rgba(255,255,255,1)');
                gradient.addColorStop(1,o.color);//'rgba(255,255,0,1)');
				
				ctx.fillStyle = gradient;//o.color;
				ctx.beginPath();
                ctx.arc(currPoint[0] , currPoint[1] , r , 0 , PI*2 , true);
				ctx.closePath();
                ctx.fill();
            }
        },
        Fireworks = function( cf ){
            this.config = {
                point: [100 , 100],//中心点
                speed: 2.5, //爆炸的初始速度
                pisNum: 400, //小烟花数
                color: '#000', // 烟花的颜色
                time: 2 // 烟花结束的时间
            }
            
            $.extend( this.config , cf );
            var t = this , o = t.config ,
				now = new Date();
            
			if(pieces.length > MAX_NUM) return;
            // 初始this.pisNum 个数的烟花瓣
            for (var i = 0 , len = o.pisNum; i < len; i++){
                pieces.push(new Piece(mix({
					t: now/1000,
					x: o.point[0],
					y: o.point[1],
					//z: random()*100, // 距离较近的速度会大点
					speed: o.speed + 1*random(),
					energy: random()*200,
                    theta: 2*PI*random(),
                    eleva: PI/2 - PI*random(), // 仰角只能是pi/2  - > -pi/2
					color: getRandomColor(),
                } , this.config , false )));
            }
        };



    // exports
    exports.fireworks = function( $dom , cf ){
		var can = $dom.get(0);
		CTX = can.getContext('2d');
		CAN_WIDTH = can.width;
		CAN_HEIGHT = can.height;
		if(cf.autoPlay){ // 自动烟花
			setTimeout(function(){
				pieces.push(new Piece({
					t: new Date()/1000,
					x: 50 + (CAN_WIDTH - 100)*random(),
					y: CAN_HEIGHT,
					speed: 5 + 2*random(),
					energy:20000*random(),
					theta: -PI/2,
					eleva: 0,
					color: getRandomColor(),
					onhide: function(pie){
						new Fireworks($.extend(cf , {
							point: [pie.xDis , pie.yDis]
						}));
					}
				}));
				setTimeout(arguments.callee , 500 + 1000*random());
			} , 1000);
		}
		if(cf.enableClick){ // 支持点击事件
			$dom.click(function(e){
				new Fireworks($.extend(cf , {
					point: [e.offsetX , e.offsetY]
				}));
			});
		}
    }
});
 