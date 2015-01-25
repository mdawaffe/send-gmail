var Google = Google = require( 'googleapis' );

/**
 * options:
 * 	client: (Google.auth.OAuth2) required. OAuth2 client for communicating with the Gmail API.
 *	        Should already have credentials set.
 * 	draft: (boolean) default=false.  True to save a draft instead of sending an email
 */
function GmailTransport( options ) {
	if ( ! ( this instanceof GmailTransport ) ) {
		return new GmailTransport( options );
	}

	this.options = options || {};
	this.name = 'Gmail';
	this.version = '0.0.1';

	this._gmail = Google.gmail( { version: 'v1', auth: options.client } )
}

GmailTransport.prototype.send = function( mail, callback ) {
	if ( this.options.error ) {
		setImmediate( function() {
			callback( new Error( this.error ) );
		}.bind( this ) );
		return;
	}

	var message = mail.message.createReadStream();

	var info = {
		messageId: ( mail.message.getHeader( 'message-id' ) || '' ).replace( /[<>\s]/g, '' ),
		envelope: mail.data.envelope || mail.message.getEnvelope(),
		account: this.options.client.credentials.email
	};

	var send = this.options.draft ? this._gmail.users.drafts.create : this._gmail.users.messages.send;

	send( {
		userId: "me",
		media: {
			mimeType: "message/rfc822",
			body: message
		}
	}, function( err, response ) {
		info.response = response;
		callback( err, info );
	} );
};

module.exports = GmailTransport;
