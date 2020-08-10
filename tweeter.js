var Twitter = require("twitter");


var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var user_id;
async function authenticate() {
    const user = await client.get("account/verify_credentials", { skip_status: true, include_entities: false })
    console.log("Current user: " + user.name);
    user_id = user.screen_name;
}

async function getMyLastTweet() {
    const tweets = await client.get("statuses/user_timeline", { user_id: user_id, count: 1, trim_user: 1, exclude_replies: 1, include_rts: 0 })
    if (tweets.length == 0)
        return null
    else {
        return tweets[0];
    }
}

exports.getTimeSinceLastTweet = async () => {
    await authenticate()
    const lastTweet = await getMyLastTweet()

    if (lastTweet == null)
        return null
    else {
        var tweetDate = Date.parse(lastTweet.created_at);
        var now = Date.now();
        return now - tweetDate
    }
}

exports.tweet = async (status, imageBuffer) => {
    if (imageBuffer) {
        // Make post request on media endpoint. Pass file data as media parameter
        const media = await client.post('media/upload', { media: imageBuffer });
        // If successful, a media object will be returned.
        console.log(media);

        // Lets tweet it
        status.media_ids = media.media_id_string;
    }
    
    const tweet = await client.post('statuses/update', status);
    console.log(tweet);
}