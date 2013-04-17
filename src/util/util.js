;;define(function(require , exports , model){
    var ex = {};
    var $ = require('jquery');
    $.extend( ex , {
        /*
         * 把字符串按照一定的格式替换里面的变量，对象属性p与变量之间的关系为{p}
         * @param {string} // 需要替换的模板字符串
         * @param {obj} //对象
         * @return {string}
         * @example
            var template = "<div class='#{class}' ishidden='#{hidden}'>{value}</div>";
            var obj = {class:"aaa",hidden:"true",value:"11111111"}
            format(template,obj);
         */
        format: function(string,obj){
            return string.replace(/#\{(.*?)\}/g , function($0 , $1){
                return obj[$1] === undefined || obj[$1] === false ? "" : obj[$1];
            });
        },
        toQuery: function(data){
            if(!data) return '';
            var aHtml = [];
            for (var key in data){
                aHtml.push(key + '=' + data[key]);
            }
            return aHtml.join('&');
        },
        toJson: function(s){
            if(!s) return {};
            var arr = s.split('&') , result = {} , temp;
            for (var i = 0 , len = arr.length ; i<len;i++){
                temp = arr[i].split('=');
                result[temp[0]] = temp[1];
            }
            return result;
        },
        // TODO ...
        // FOR IE6
        fixed: function( $dom , top , left ){
        },
        /*
         widthMask no esist
         */
        absoluteToCenter: function( $dom ,fixAutoSize , widthMask , $target ){
            $dom.css({position: 'absolute'});
            var h = $dom.height(),
                w = $dom.width(),
                $mask = null,
                marginTop = $dom.css('margin-top').match(/\d+/),
                marginLeft = $dom.css('margin-left').match(/\d+/),
                marginTopNum = marginTop ? marginTop[0] : 0,
                marginLeftNum = marginLeft ? marginLeft[0] : 0;
            function fixpos(){
                var port = {};
                if(!$target){
                    port = GJ.getViewPort();
                }else{
                    var off = $target.offset();
                    port = {
                        top: off.top,
                        left: off.left,
                        height: $target.height(),
                        width: $target.width()
                    }
                }
                $dom.css({
                    zIndex: 90001,
                    top: port.top + (port.height - h)/2 - marginTopNum,
                    left: port.left + (port.width - w)/2 -marginLeftNum
                });
            }
            function fixMask(){
                if(!widthMask) return;
                var db = document.body;
                if(!$mask){
                    $mask = $('<div></div>').css({
                        position: 'absolute',
                        zIndex: 90000,
                        opacity: .5,
                        backgroundColor: '#000',
                        left: 0,
                        top: 0
                    }).appendTo(db);
                }
                $mask.css({
                    height: Math.max($(window).height() , $(db).height()),
                    width: Math.max($(window).width() , $(db).width())
                });
            }
            function fix(){
                fixpos();
                fixMask();
            }
            fix();
            if(fixAutoSize){
                $(window).resize(function(){
                    fix();
                });
            }

            return {
                hide: function(){
                    $mask.hide();
                    $dom.hide();
                },
                remove: function(){
                    $mask.remove();
                    $dom.remove();
                }
            }
        },
        getFormData: function($form){
            var f = $form.get(0),
                result = {};
            $form.find('input,textarea,select').each(function(i , item){
                var name = item.name,
                    val = item.value;
                if(!name) return;
                // select can had default-value attribute
                val= item.tagName != 'SELECT' && val == $(item).attr('default-value')? '' : val;
                if(item.tagName.toLowerCase() == 'input'){
                    switch(item.type){
                        case 'checkbox':
                            if(item.checked){
                                result[name] = result[name]? result[name] + ',' + val : val;
                            }
                            break;
                        case 'radio':
                            if(item.checked){
                                result[name] = val;
                            }
                        default:
                            result[name] = val;
                            break;
                    }
                }else{
                    result[name] = val;
                }
            });
            return result;
        },
        selectTag: function($list , cb , selectClass , eventType){
            selectClass = selectClass || 'selected';
            eventType = eventType || 'click';
            $list[eventType](function(ev){
                $list.removeClass(selectClass);
                $(this).addClass(selectClass);
                cb && cb.call(this , $(this));
            });
        },
        processBar: function ($proBar , $proMsg){
            var prog = 0,
                step = 0,
                stepAdd = 12,
                _timer = function(){
                    if (prog >= 99) return false;
                    stepAdd--;
                    if (stepAdd < 2)stepAdd = 2;
                    prog += stepAdd;
                    step ++;
                    $proMsg && $proMsg.html(prog+"%");
                    $proBar.animate({width : prog + '%'}, step*30, null, _timer);
                };
            return {
                stop: function(){
                    $proBar.stop(true);
                    return this;
                },
                end: function(){
                    $proMsg && $proMsg.html('100%');
                    $proBar.css('width' , '100%');
                    return this;
                },
                start: function(){
                    _timer();
                    return this;
                },
                reset: function(){
                    prog = 0;
                    step = 0;
                    stepAdd = 12;
                    $proMsg && $proMsg.html('0%');
                    $proBar.stop(true).css('width' , '0%');
                    return this;
                }
            }
        },

        dateSelect: function($year , $month , $date , start , end){
            var now = new Date() , bigMonths = [1,3,5,7,8,10,12],
                emptyOption = '<option value="">请选择</option>',
                getOption = function(value , selectValue){
                    return ['<option value="' , value , '"' , selectValue == value ? ' selected ' : '' , '>' , value , '</option>'].join('');
                },
                getDates = function(year , month){
                    if($.inArray( month , bigMonths) >=0 ){
                        return 31;
                    }else if(month == 2){
                        if((!(year%4) && year%100) || !(year%400)){
                            return 29;
                        }else{
                            return 28;
                        }
                    }else{
                        return 30;
                    }
                },
                setDate = function(num){
                    var currDate = $date.val();
                    $date.html(emptyOption);
                    for (var i = 1; i <= num; i++ ){
                        $date.append(getOption(i , currDate));
                    }
                },
                dYear = $year[0].getAttribute('value'),
                dMonth = $month[0].getAttribute('value'),
                dDate = $date[0].getAttribute('value');
            end = [now.getFullYear() , 12 , 31].join('-') || end || [now.getFullYear() , (now.getMonth() + 1) , now.getDate()].join('-');
            var starDateArr = start.split('-') , endDateArr = end.split('-');
            // deal width year
            $year.html(emptyOption);
            for (var i = endDateArr[0]; i >= starDateArr[0]; i--){
                $year.append(getOption(i , dYear));
            }
            // deal width month
            $month.html(emptyOption);
            if(endDateArr[0] == starDateArr[0]){
                for (var i = starDateArr[1]; i<= endDateArr[1]; i++){
                    $month.append(getOption(i , dMonth));
                }
            }else{
                for (var i = 1; i<= 12; i++){
                    $month.append(getOption(i , dMonth));
                }
            }

            // deal width date
            setDate(getDates($year.val() , $month.val()));

            // deal width event
            $year.change(function(){
                var year = parseInt($year.val()) , month = parseInt($month.val()) , maxMonth = 12;
                if(year == endDateArr[0]){
                    maxMonth = endDateArr[1];
                }
                $month.html(emptyOption);
                for (var i = 1 ; i <= maxMonth; i ++){
                    $month.append(getOption(i , month));
                }
            });
            $year.add($month).change(function(){
                var year = parseInt($year.val()) , month = parseInt($month.val()) , date = parseInt($date.val());
                if(month == 0 || date == 0) return;
                setDate(getDates(year , month));
            });
        },
    });

    // +-1
    (function(){
        var data = 'date-change-plus-reduce',
            _changeAnimate = function($var , isPlus , cb){
                var sNum        =   $var.html(),
                    isNagitve   =   sNum.match(/^-/),
                    isPlus      =   isPlus ^ isNagitve,
                    len         =   sNum.length,
                    realNum     =   parseInt(sNum) + (isPlus ? 1 : -1),
                    reg1        =   isPlus ? /9+$/ : /0+$/,
                    match       =   sNum.match(reg1),
                    matchLength =   match ? match[0].length : 0,
                    leftNum     =   sNum.substring(0 , len - matchLength - 1 ),
                    currNum     =   sNum.substring(len - matchLength - 1) ,
                    nextNum     =   parseInt(currNum) + 1,
                    preNum      =   parseInt(currNum) - 1,
                    $currNum = $('<var></var>').css({
                        visibility: 'hidden'
                    }).html(currNum);

                // render left num
                $var.html(leftNum).append($currNum);
                if($.browser.msie)
                    $var.css({'padding-left': 1 , 'margin-left': -1});
                var currNumHeight = $currNum.height();
                // append new dom
                var $absoluteNum = $('<var></var>').css({
                    position    :   "absolute",
                    right       :   0,
                    //'text-align':   'right',
                    'line-height':  currNumHeight + 'px',
                    top         :   0,
                    height      :   currNumHeight,
                    overflow    :   'hidden'}).html('<em style="position: relative;">' + (isPlus ? currNum : preNum) + '<br/>' +  (isPlus ? nextNum : currNum) + '</em>').appendTo($var);

                $absoluteNum.find('em').css('top' , isPlus ? 0 : -currNumHeight).stop(true , true).animate({
                    top: isPlus ? -currNumHeight : 0
                } , 300 , '' , function(){
                    $(document.createTextNode(realNum)).insertAfter($var);
                    $var.remove();
                    cb && cb();
                });
            },
            changNumFn = function($dom , isPlus){
                if($dom.data(data)) return;
                $dom.data(data , true).html($dom.html().replace(/[+-]?\d+/ , function($1){
                    return '<var>' + $1 + '</var>';
                }));

                 $dom.find('var').css({
                    position: 'relative'
                }).each(function(){
                    _changeAnimate($(this) , isPlus , function(){
                        $dom.removeData(data);
                    });
                })
            };

        $.extend( ex ,  {
            plus: function($dom , num){
                if( num && num > 1) {
                    $dom.each(function(i , dom){
                        $(dom).html(parseInt($dom.html()) + num);
                    });
                    return;
                }
                $dom.each(function(i , dom){
                    changNumFn($(dom) , true);
                });
            },
            reduce: function($dom , num){
                if( num && num > 1) {
                    $dom.each(function(i , dom){
                        $(dom).html(parseInt($dom.html()) - num);
                    });
                    return;
                }
                $dom.each(function(i , dom){
                    changNumFn($(dom) , false);
                });
            }
        } , true);
    })();

    // exports
    $.extend( exports , ex , true );
});
