Send or Draft Gmail Messages
============================

Usage
-----

```
$ ./send-gmail --help

Usage: send-gmail TO_ADDRESS+ [OPTIONS]

Draft an email through Gmail.  Can optionally send instead with --send.

If set, STDIN is used as the message body.

Gets and uses oAuth2 credentials.

  -s, --subject=STRING
  -c, --cc=ADDRESS+                  Use multiple arguments to CC multiple addresses.
  -b, --bcc=ADDRESS+                 Use multiple arguments to BCC multiple addresses.
  -t, --to=ADDRESS+                  Explicit argument for TO address. Use multiple arguments to send to multiple addresses.
  -a, --attachment=PATH+             Pathname to attachment. MIME type will be detected from the extension. Use multiple arguments to attach multiple files.
  -A, --attachment-filename=STRING+  Used to change the name of the attached file (e.g., to set the correct MIME type or if the attachment is being streamed).
  -S, --send                         Don't create a draft: send a message.
  -N, --no-open                      Don't open the message for editing in Gmail.
  -C, --config=STRING                Path to config path. Default's to current directory's config.json.
  -r, --inreplyto=STRING             Message ID of the e-mail we'd like to reply to (also put in references)
  -h, --help

Examples:

echo 'Hello World' | send-gmail foo@example.com --subject Hello

send-gmail foo@example.com --subject 'Attachments' --attachment photo.jpeg < body.txt

send-gmail foo@example.com --subject 'Fancy' \
	--attachment <( grep 404 /var/log/apache2/access_log ) \
	--attachment-filename 404-logs.txt
```

Config
------

`config.json`

```js
{
	"google": {
		"CLIENT_ID": "...",
		"CLIENT_SECRET": "...",
		"REDIRECT_URL": "urn:ietf:wg:oauth:2.0:oob" // required
		"RESTRICT_AUTH_DOMAIN" : "my-google-apps-domain.com", // optional
	}
}
```
