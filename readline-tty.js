/**
 * Ensures that the readline instance returned is talking to the TTY.
 * Starting readline with process.stdin may not be a TTY if the process
 * accepts input on STDIN.
 *
 * Useful for CLI scripts.
 */
var fs = require( 'fs' );
var TTY = require( 'tty' );
var Readline = require( 'readline' );

function createInterfaceFromTTY( output, completer, terminal ) {
	if ( arguments.length === 1 ) {
		completer = output.completer;
		terminal = output.terminal;
		output = output.output;
	}

	var tty;
	if ( process.stdin.isTTY ) {
		tty = process.stdin;
	} else {
		tty = TTY.ReadStream( fs.openSync( '/dev/tty', 'r' ) );
	}

	return Readline.createInterface( tty, output, completer, terminal );
}

module.exports.createInterfaceFromTTY = createInterfaceFromTTY;
