var open = require( 'opn' );

function openURL( url, callback ) {
	open( url, { wait: false } ).
		then( function() {
			callback();
		} ).
		catch( function( error ) {
			callback( error );
		} );
}

module.exports = openURL;
