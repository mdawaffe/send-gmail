var fs = require( 'fs' );
var TTY = require( 'tty' );
var assert = require( 'assert' );

var Google = require( 'googleapis' );
var OAuth2 = Google.auth.OAuth2;
var async = require( 'async' );

var openURL = require( __dirname + '/open-url' );
var Readline = require( __dirname + '/readline-tty' );

function getStoredCredentials( callback ) {
	fs.readFile( '.credentials', 'utf8', function( err, response ) {
		if ( err ) {
			callback( null, false );
			return;
		}

		try {
			callback( null, JSON.parse( response ) );
		} catch ( e ) {
			callback( null, false );
		}
	} );
}

function getCredentials( storedCredentials, callback ) {
	var scopes = [
		'https://www.googleapis.com/auth/gmail.compose'
	];

	if ( storedCredentials && storedCredentials.access_token ) {
		this.client.setCredentials( storedCredentials );

		if ( storedCredentials.expiry_date > Date.now() + 600000 ) {
			callback( null, false );
			return;
		} else if ( storedCredentials.refresh_token ) {
			this.client.refreshAccessToken( function( err, credentials ) {
				callback( err, credentials );
			} );
			return;
		}
	}

	var url = this.client.generateAuthUrl( {
		access_type: 'offline',
		scope: scopes,
		hd: this.config.google.RESTRICT_AUTH_DOMAIN,
	} );

	openURL( url, function( err ) {
		if ( err ) {
			callback( err );
			return;
		}

		try {
			var readline = Readline.createInterfaceFromTTY( {
				output: process.stdout
			} );
		} catch ( e ) {
			callback( e );
			return;
		}

		function closeAndCallback( err, credentials ) {
			readline.close();
			callback( err, credentials );
		}

		readline.question( 'Enter the code from Google: ', function( code ) {
			console.log( 'You can close the authentication tab in your browser now.' );
			this.client.getToken( code, function( err, credentials ) {
				if ( err ) {
					closeAndCallback( err, credentials );
					return;
				}

				this.client.setCredentials( credentials );
				closeAndCallback( null, credentials );
			}.bind( this ) );
		}.bind( this ) );
	}.bind( this ) );
}

function getEmailAddress( credentials, callback ) {
	if ( credentials.email ) {
		callback( null, credentials );
		return;
	}

	var gmail = Google.gmail( { version: 'v1', auth: this.client } );

	gmail.users.getProfile( { userId: "me", fields: "emailAddress" }, function( err, response ) {
		if ( err ) {
			callback( err );
		} else {
			credentials.email = response.emailAddress;
			callback( null, credentials );
		}
	} );
}

function saveCredentials( credentials, callback ) {
	if ( credentials ) {
		fs.writeFile( '.credentials', JSON.stringify( credentials, null, "\t" ), function( err ) {
			callback( err );
		} );
	} else {
		callback( null );
	}
}

function Authenticate( config ) {
	if ( ! ( this instanceof Authenticate ) ) {
		return new Authenticate( config );
	}

	this.config = config;
	this.client = new OAuth2( config.google.CLIENT_ID, config.google.CLIENT_SECRET, config.google.REDIRECT_URL );
}

function authenticate( callback ) {
	async.waterfall( [
		getStoredCredentials,
		getCredentials.bind( this ),
		getEmailAddress.bind( this ),
		saveCredentials
	], callback );
}

Authenticate.prototype.authenticate = authenticate;

module.exports = Authenticate;
