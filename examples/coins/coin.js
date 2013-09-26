
var coins = [ 5, 2, 1 ];
var result = [];

var loop = function( left , index , arr ){
	if( index >= coins.length ){
		left == 0 ? result.push( arr ) : '';
		return;
	}

	for ( var x = ~~( left / coins[ index ] ) ; x >= 0 ; x--){
		var tmp = [].concat( arr );
		tmp.push( x );
		arguments.callee( left - x * coins[ index ] , index + 1 , tmp );
	}
}

loop( 10 , 0 , [] );
console.log( result );


result = [];
var tmpArr = [];
var loop2 = function( left , index ){
	if( index >= coins.length - 1 ){
		tmpArr.push( left / coins[ coins.length - 1 ] );
		if( left % coins[ coins.length - 1 ] == 0 ){
			result.push( [].concat(tmpArr) );
		}

		tmpArr.pop();
		for( var y = tmpArr.length - 1; tmpArr[y] == 0 ; y-- ){
			tmpArr.pop();
		}
		tmpArr.pop();
		return;
	}

	for ( var x = ~~( left / coins[ index ] ) ; x >= 0 ; x--){
		tmpArr.push( x );
		arguments.callee( left - x * coins[ index ] , index + 1 );
	}
}


loop2( 10 ,0  );
console.log( result );