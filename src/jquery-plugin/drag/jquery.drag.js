/**
* jquery的拖拽组件，使用方式$("#id").drag();
* 如果需要在拖动时做些处理，可以给drag函数传递一些参数，如：
*	onDragStart 表示在开始拖拽之前需要执行的内容
*	onDrag 表示在拖动时做什么
*	onDragEnd 表示在拖动结束后需要做什么
*	zIndex防止有其它的浮动元素时拖动元素被覆盖而设置的起始z-index值，每拖动一次，该值就会增加1，保证了最新的拖动元素显示在最前面

*	说明：这些方法里的this都是当前需要拖动的dom元素对象，第一个参数为当前jquery的事件对象ev
*	后期工作：需要添加对像窗口拖拽类似的，只有一部分可以拖拽，但移动整体的情况
*/
(function($){
	/*
	* 根据目标拖动元素与范围元素，和下一次的left，top值计算出正确的left，top值
	*/
	function getRightLeftTop( dom , area , left , top ){
		var $area 	= $(area)
		, $dom 		= $(dom)
		, areaOffset= $area.offset()
		, domOffset = $dom.offset();
		left 	= Math.max( left , areaOffset.left );
		left 	= Math.min( left , areaOffset.left + $area.width() - $dom.width() );
		top 	= Math.max( top , areaOffset.top );
		top 	= Math.min( top , areaOffset.top + $area.height() - $dom.height() );
		return {
			left 	: left
			,	top : top
		};
	}
	function getNum(s){
		return parseInt(s.match(/\d+/));
	}
	/*
	*  鼠标移动事件，如果开始移动，会调用options.onDragStart方法
	*  然后调用options.onDrag方法
	*/
	function handleMouseMove(ev){
		if(!status.dragEl)return;
		//判断鼠标是否有小范围的移动
		if(Math.abs(ev.clientX - status.mouseDownXY[0]) < 2 && Math.abs(ev.clientY - status.mouseDownXY[1]) < 2){
			return;
		}
		if(!status.dragging){
			status.dragging = true;
			(options.onDragStart || $.noop).call(status.dragEl,ev);
		}
		var left = ev.clientX - status.delayXY[0],top = ev.clientY - status.delayXY[1];
		// judge if dragEl is out of range
		//if(isOutRange(status.dragEl,options.moveArea,left,top))
		//	return;
		if(options.moveArea){
			var result = getRightLeftTop(status.dragEl,options.moveArea,left,top);
			left = result.left;
			top = result.top;
		}
		$(status.dragEl).css({
			left:left,
			top:top
		}).addClass("dragging-el");
		(options.onDrag || $.noop).call(status.dragEl,ev);
		return false;
	}
	/*
	*	定义mouseup事件
	*	取消了mousemove和mouseup事件的绑定，清除各种状态等
	*/
	function handleMouseUp(ev){
		$(document).unbind("mousemove",handleMouseMove);
		$(document).unbind("mouseup",handleMouseUp);
		if(status.dragging){
			$(status.dragEl).removeClass("dragging-el");
			(options.onDragEnd || $.noop).call(status.dragEl,ev);
		}
		status.dragEl = null;		
		status.dragging = false;
	}
	$.fn.extend({
		drag : function( op ){
			var options = {
				zIndex 		: 1000
				, dragParent: "" // 局部定位，拖动父元素的设置
				, moveArea 	: null // 移动元素的拖动范围
			}
			$.extend( options , op );
			var status = {};
			/*
			*  使用live绑定mousedown事件
			*/
			$( this ).live( "mousedown" , function(ev){
				//获取当前单击的元素是否为需要拖动的元素，如果不是，则直接退出
				status.dragEl = options.dragParent?$(this).closest(options.dragParent)[0]:this;
				$(status.dragEl).css({
					zIndex:options.zIndex++,
					position:"absolute"
				});
				if(!status.dragEl) return;
				//重置拖动状态，以便重新执行onDragStart接口
				status.dragging = false;
				//记录拖动的开始位置及偏移量
				status.mouseDownXY = [ev.clientX,ev.clientY];
				var elPosition = $(status.dragEl).offset(),
					//do with margin
					marginLeft = getNum($(status.dragEl).css("marginLeft")) || 0,
					marginTop = getNum($(status.dragEl).css("marginTop")) || 0;
				
				status.delayXY = [ev.clientX-elPosition.left+marginLeft,ev.clientY - elPosition.top+marginTop];
				//注册移动相应的事件
				$(document).mousemove(handleMouseMove);
				$(document).mouseup(handleMouseUp);
			});
			return this;
		}
	});
})(jQuery)