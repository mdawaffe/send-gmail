var fs = require( 'fs' );
var TTY = require( 'tty' );
var assert = require( 'assert' );

var Google = require( 'googleapis' );
var OAuth2 = Google.auth.OAuth2;
var async = require( 'async' );

var config = require( './config.json' );

var openURL = require( './open-url' );
var Readline = require( './readline-tty' );

var oauth2Client = new OAuth2( config.google.CLIENT_ID, config.google.CLIENT_SECRET, config.google.REDIRECT_URL );

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
		oauth2Client.setCredentials( storedCredentials );

		if ( storedCredentials.expiry_date > Date.now() + 600000 ) {
			callback( null, false );
			return;
		} else if ( storedCredentials.refresh_token ) {
			oauth2Client.refreshAccessToken( function( err, credentials ) {
				callback( err, credentials );
			} );
			return;
		}
	}

	var url = oauth2Client.generateAuthUrl( {
		access_type: 'offline',
		scope: scopes,
		hd: config.google.RESTRICT_AUTH_DOMAIN,
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
			oauth2Client.getToken( code, function( err, credentials ) {
				if ( err ) {
					closeAndCallback( err, credentials );
					return;
				}

				oauth2Client.setCredentials( credentials );
				closeAndCallback( null, credentials );
			} );
		} );
	} );
}

function getEmailAddress( credentials, callback ) {
	if ( credentials.email ) {
		callback( null, credentials );
		return;
	}

	var gmail = Google.gmail( { version: 'v1', auth: oauth2Client } );

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

function authenticate( callback ) {
	async.waterfall( [
		getStoredCredentials,
		getCredentials,
		getEmailAddress,
		saveCredentials
	], callback );
}

module.exports = {
	authenticate: authenticate,
	client: oauth2Client
};
