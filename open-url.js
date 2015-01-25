var format = require( 'util' ).format;
var spawn = require( 'child_process' ).spawn

function openURL( url, callback ) {
	var open = spawn( 'open', [ url ] );

	open.on( 'error', callback );

	open.on( 'close', function( exitCode ) {
		if ( exitCode ) {
			callback( format( 'Could not open URL "%s" [%d]', url, exitCode ) );
			return;
		}

		callback( null, url );
	} );
}

module.exports = openURL;
