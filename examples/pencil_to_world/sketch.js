define( function( require , exports , model ){
    /**
     * 把图像变成黑白色
     * Y = 0.299R + 0.587G + 0.114B
     * @param  {Array} pixes pix array
     * @return {Array}
     * @link {http://www.61ic.com/Article/DaVinci/DM64X/200804/19645.html}
     */
    function discolor( pixes ) {
        var grayscale;
        for (var i = 0, len = pixes.length; i < len; i += 4) {
            grayscale = pixes[i] * 0.299 + pixes[i + 1] * 0.587 + pixes[i + 2] * 0.114;
            pixes[i] = pixes[i + 1] = pixes[i + 2] = grayscale;
        }
        return pixes;
    }

    /**
     * 把图片反相, 即将某个颜色换成它的补色
     * @param  {Array} pixes pix array
     * @return {Array}
     */
    function invert(pixes) {
        for (var i = 0, len = pixes.length; i < len; i += 4) {
            pixes[i] = 255 - pixes[i]; //r
            pixes[i + 1] = 255 - pixes[i + 1]; //g
            pixes[i + 2] = 255 - pixes[i + 2]; //b
        }
        return pixes;
    }
    /**
     * 颜色减淡,
     * 结果色 = 基色 + (混合色 * 基色) / (255 - 混合色)
     * @param  {Array} basePixes 基色
     * @param  {Array} mixPixes  混合色
     * @return {Array}
     */
    function dodgeColor(basePixes, mixPixes) {
        for (var i = 0, len = basePixes.length; i < len; i += 4) {
            basePixes[i] = basePixes[i] + (basePixes[i] * mixPixes[i]) / (255 - mixPixes[i]);
            basePixes[i + 1] = basePixes[i + 1] + (basePixes[i + 1] * mixPixes[i + 1]) / (255 - mixPixes[i + 1]);
            basePixes[i + 2] = basePixes[i + 2] + (basePixes[i + 2] * mixPixes[i + 2]) / (255 - mixPixes[i + 2]);
        }
        return basePixes;
    }

    /**
     * 高斯模糊
     * @param  {Array} pixes  pix array
     * @param  {Number} width 图片的宽度
     * @param  {Number} height 图片的高度
     * @param  {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
     * @param  {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
     * @return {Array}
     */
    function gaussBlur(pixes, width, height, radius, sigma) {
        var gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k, len;

        radius = Math.floor(radius) || 3;
        sigma = sigma || radius / 3;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -radius; x <= radius; x++, i++){
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0, len = gaussMatrix.length; i < len; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for(j = -radius; j <= radius; j++){
                    k = x + j;
                    if(k >= 0 && k < width){//确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for(j = -radius; j <= radius; j++){
                    k = y + j;
                    if(k >= 0 && k < height){//确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i] = r ;
                // pixes[i + 1] = g ;
                // pixes[i + 2] = b ;
                // pixes[i + 3] = a ;
            }
        }
        //end
        return pixes;
    }

    /*
     * 动感模糊
     */
    function motionBlur( pixes , radius , deg ){
        var flag = 0;
        var deg = deg || 0;
        var r = radius;
        if ( deg >= 0 && deg < 90 ){
            deg = deg;
            flag = 1;
        } else if( deg >= 90 && deg < 180 ){
            deg = 180-deg;
            flag = 2;
        } else if( deg >= 180 && deg < 270 ){
            deg = deg-180;
            flag = 3;
        } else {
            deg = 360-deg;
            flag = 4;
        }
        var degPi = deg / 180 * Math.PI;
        var H = Math.floor( r * Math.sin( degPi ));
        var W = Math.floor( r * Math.cos( degPi ));
        H = H | 1;
        W = W | 1;
        var zeros = function( h , w ){
            var matrix = [];
            for(var i = 1; i <= h ; i++ ){
                for(var j = 1;j <= w; j++){
                    matrix[ i - 1 ] = matrix[ i - 1 ] || [];
                    matrix[ i - 1 ][ j - 1 ] = 0;
                }
            }

            return matrix;
        }
        var foreach = function( matrix , fn ){
            var h = matrix.length;
            var w = matrix[0].length;
            for(var i = 1; i <= h ; i++ ){
                for(var j = 1;j <= w; j++){
                    fn( i , j );
                }
            }
        }

        // 获取卷积矩阵模板
        var mix = zeros( H , W );
        if( deg != 90 && deg != 270 ){
            foreach( mix , function( i , j ){
                if( Math.round( j * Math.tan( degPi ) ) + 1 == i ){
                    mix[ i - 1 ][ j - 1 ] = r;
                }
            } );
        } else {
            foreach( mix , function( i , j ){
                mix[ i - 1 ][ j - 1 ] = j == 1 ? r : 0;
            } );
        }
        // 计算所有矩阵元素之和
        var sum = function( matrix ){
            var r = 0;
            foreach( matrix , function( i , j ){
                r += matrix[ i - 1 ][ j - 1 ];
            } );

            return r;
        }
        // 矩阵上下翻转
        var flipud = function( matrix ){
            var h = matrix.length , w = matrix[0].length;
            foreach( matrix , function( i , j ){
                if( i <= h / 2 ){
                    var preline = matrix.splice( i - 1 , 1 , matrix[ h - i ] );
                    matrix.splice( h - i + 1 , 1 , preline[ 0 ] );
                }
            });

            return matrix;
        }

        // 设置矩阵的值
        var setMatrixValue = function( matrix , top , left , matrix2 , top2 , left2 , height2 , width2 ){
            top2 = top2 || 1;
            left2 = left2 || 1;
            var h = height2 ? height2 :  matrix2.length - top2 + 1;
            var w = width2 ? width2 : matrix2[0].length - left2 + 1;
            for(var i = 1 ; i <= h ; i++ ){
                for (var j = 1 ; j <= w ; j++ ) {
                    matrix[ top - 1 + i - 1 ][ left - 1 + j - 1 ]  =
                        matrix2[ i - 1 + top2 - 1 ] [ j - 1 + left2 - 1];
                };
            }
        }
        // 获取子集
        var subMatrix = function( matrix , top , left , height , width ){
            var newMatrix = [];
            for( var i = 0 ; i < height ; i ++ ){
                for( var j = 0 ; j < width ; j ++ ){
                    newMatrix[ i ] = newMatrix[ i ] || [];
                    newMatrix[ i ] [ j ] = matrix[ top + i - 1 ][ left + j - 1 ];
                }
            }
            return newMatrix;
        }
        var multiply = function( matrix , matrix2 ){
            var newMatrix = [];
            foreach( matrix , function( i , j ){
                newMatrix[ i - 1 ] = newMatrix[ i - 1 ] || [];
                newMatrix[ i - 1 ][ j - 1 ] = matrix[ i - 1 ] [ j - 1 ] * matrix2[ i - 1 ] [ j - 1 ];
            } );
            return newMatrix;
        }

        var total = sum( mix );
        foreach( mix , function( i , j ){
            mix[ i - 1 ][ j - 1 ] /= total ;
        } );

        if( flag == 1 || flag == 3 ){
            mix = flipud( mix );
        }

        total = sum( mix );
        var HH = Math.floor( H / 2 );
        var WW = Math.floor( W / 2 );

        var m = pixes.height;
        var n = pixes.width;

        var blur = function( num ){
            var imgn = zeros( m + H , n + W );
            var imgMatrix = zeros( m , n );
            for(var  i = 1 ; i <= m ; i ++ ){
                for (var j = 1 ; j <=n ; j ++ ){
                    var k = ( ( i - 1 ) * n + j - 1 ) * 4;
                    imgMatrix[ i - 1 ][ j - 1 ] = pixes.data[ k + num ];
                };
            }
            setMatrixValue( imgn , HH+1 , WW+1 , imgMatrix );
            setMatrixValue( imgn , 1 , WW+1 , imgMatrix , 1 , 1 , HH , n ); //imgn(1:HH,WW+1:n+WW)=img(1:HH,1:n);
            setMatrixValue( imgn , 1 , n+WW+1 , imgn , 1 , n , m+HH , WW + 1 ); //imgn(1:m+HH,n+WW+1:n+2*WW+1)=imgn(1:m+HH,n:n+WW);
            setMatrixValue( imgn , m+HH+1 , WW+1 , imgn , m , WW+1 , 1+HH , n+WW+1 );
            //imgn(m+HH+1:m+2*HH+1,WW+1:n+2*WW+1)=imgn(m:m+HH,WW+1:n+2*WW+1);
            setMatrixValue( imgn , 1 , 1 , imgn , 1 , WW+1 , m+2*HH+1 , WW );
            //imgn(1:m+2*HH+1,1:WW)=imgn(1:m+2*HH+1,WW+1:2*WW);
            console.time( 'num ' + num + ' : ' );
            for( var i = HH+1 ; i <= m+HH ; i++ ){
                for( var j = WW+1 ; j <= n+WW ; j++ ){
                    var sub = subMatrix( imgn , i-HH , j-WW , H , W );
                    var s = multiply( sub , mix );
                    imgn[ i - 1 ] [ j - 1 ] = ~~ sum(s)/total;
                }
            }
            console.timeEnd( 'num ' + num + ' : ' );

            imgMatrix = subMatrix( imgn , HH+1 , WW+1 , m , n );

            foreach( imgMatrix , function( i , j ){
                pixes.data[ 4 * (( i - 1 ) * n + j - 1 ) + num ] = imgMatrix[ i - 1 ] [ j - 1 ];
            } );
        }

        function blur1( k ){
            var invok = 240 , first , total = [ invok * r , invok * r , invok * r ] , vr , vg , vb , k;
            var imgMatrix = [] , origin;
            for (var i = 0 ; i < r ; i++ ) {
                imgMatrix.push( [ invok , invok , invok ] );
            }
            origin = imgMatrix.concat([]);
            for(var  i = 0 ; i < m ; i ++ ){
                total = [ invok * r  , invok * r , invok * r ];
                imgMatrix = origin.concat([]);
                for (var j = 0 ; j <n ; j ++ ){
                    // reset
                    k = ( i * n + j ) * 4;
                    first = imgMatrix.shift();
                    vr = pixes.data[ k ];
                    vg = pixes.data[ k + 1 ];
                    vb = pixes.data[ k + 2 ];
                    imgMatrix.push( [vr , vg , vb] );
                    total = [total[0] - first[0] + vr , total[1] - first[1] + vg , total[2] - first[2] + vb];
                    pixes.data[ k ] = ~~ total[ 0 ] / r;
                    pixes.data[ k + 1 ] = ~~ total[ 1 ] / r;
                    pixes.data[ k + 2 ] = ~~ total[ 2 ] / r;
                };
            }
        }
        console.time('blur1');
        blur1();
        console.timeEnd('blur1');
        /*console.time('r');
        blur( 0 );
        console.timeEnd('r');
        console.time('g');
        blur( 1 );
        console.timeEnd('g');
        console.time('b');
        blur( 2 );
        console.timeEnd('b');
        */
    }

    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    /**
     * 素描
     * @param  {Object} imgData
     * @param  {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
     * @param  {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
     * @return {Array}
     */
    function sketch(imgData, radius, sigma){
        var pixes = imgData.data,
            width = imgData.width,
            height = imgData.height,
            copyPixes;

        discolor(pixes);//去色
        canvas.width = width, canvas.height = height;
        //复制一份
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(imgData, 0, 0);
        copyPixes = ctx.getImageData(0, 0, width, height).data;
        // 拷贝数组太慢
        // copyPixes = Array.prototype.slice.call(pixes, 0);
        invert(copyPixes);//反相
        gaussBlur(copyPixes, width, height, radius, sigma);//高斯模糊
        dodgeColor(pixes, copyPixes);//颜色减淡

        imgData.data = pixes;
        return pixes;
    }

    exports.sketch = sketch;
    exports.motionBlur = motionBlur;

});