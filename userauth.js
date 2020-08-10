const readline = require('readline');
const bent = require('bent')
const OAuth = require('oauth-1.0a');
const crypto = require('crypto')
const querystring = require('querystring');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const twitterPost = bent( 'https://api.twitter.com', 'POST')
var oauth

exports.config = function(config) {
    oauth = OAuth({
        consumer: {
            key: config.consumer_key,
            secret: config.consumer_secret
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto
                .createHmac('sha1', key)
                .update(base_string)
                .digest('base64')
        },
    })
}

exports.getusertoken = async function (callback) {
    try {
        const req_token = await getRequestToken();
        const pin = await goGetPin(req_token);
        getAccessToken(req_token, pin, callback);
    }
    catch (e) {
        console.error(e)
    }
};
  
var getRequestToken = async function () {
    console.log( oauth.consumer )
    
    var oauthdata = oauth.authorize({
        method: "POST",
        url: 'https://api.twitter.com/oauth/request_token',
        data: { oauth_callback: 'oob' }
    });
    var oauthheader = oauth.toHeader(oauthdata)
    let res = await twitterPost('/oauth/request_token', null, oauthheader)
    const resText = await res.text();
    const result = querystring.decode(resText);
    return result.oauth_token;
};

var goGetPin = async function (req_token) {
    var reqUrl = 'https://api.twitter.com/oauth/authenticate'
        + '?' + querystring.stringify({ oauth_token: req_token });
    console.log("Go to <" + reqUrl + ">");

    return new Promise((resolve) => {
        rl.question("Enter PIN after authenticating:", pin => {
            resolve(pin);
        });
    });
}
  
var getAccessToken = async function (request_token, pin, callback) {
    var queryData = { oauth_token: request_token, oauth_verifier: pin }
    var oauthdata = oauth.authorize({
        method: "POST",
        url: 'https://api.twitter.com/oauth/access_token',
        data: queryData
    });
    var oauthheader = oauth.toHeader(oauthdata)

    var query = querystring.encode( { oauth_token: request_token, oauth_verifier: pin } )
    let res = await twitterPost( '/oauth/access_token?' + query, null, oauthheader )
    const resText = await res.text();
    const result = querystring.decode(resText);
    callback(result.oauth_token, result.oauth_token_secret);
};