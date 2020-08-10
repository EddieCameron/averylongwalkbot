const tweeter = require('./tweeter')
const { curly, Curl, CurlFeature } = require('node-libcurl');
 
const curl = new Curl();


// // auth
// const UserAuth = require("./userauth.js");
// UserAuth.config({ consumer_key: process.env.TWITTER_CONSUMER_KEY, consumer_secret: process.env.TWITTER_CONSUMER_SECRET })

// UserAuth.getusertoken( function (token, secret) {
//     console.log(token);
//     console.log(secret);
// })

//const tramperBent = bent('GET', 200, 403)

// run every 10 mins
update()
    .catch(e => {
        console.error(e);
    });

async function update() {
    await updateTramp();

    const msPerTweet = 3 * 60 * 60 * 1000;  // 3 hrs
    //const msPerTweet = 0;  // 3 hrs
    
    const timeSinceLastTweet = await tweeter.getTimeSinceLastTweet()
    var shouldTweet = false
    if (timeSinceLastTweet == undefined)
        shouldTweet = true
    else if (timeSinceLastTweet >= msPerTweet)
        shouldTweet = true

    if (shouldTweet) {
        makeATweet();
    }
    else {
        console.log("not long enough since last tweet")
    }
}
async function updateTramp() {
    const { statusCode, data, headers } = await curly.get('https://tramper.glitch.me/tramp')
    console.log(statusCode + " did some walking");
}

async function makeATweet() {
    console.log('tweet')
    const { statusCode, data, headers } = await curly.get('https://tramper.glitch.me/where')
    if (statusCode != 200) {
        console.log("Error getting location info: " + data)
        return
    }
    
    const locationInfo = JSON.parse(data)
    console.log(locationInfo)
    
    var tweet = {
        status: encodeURI('https://tramper.glitch.me/' + locationInfo.imageidx),
        lat: locationInfo.point[0],
        long: locationInfo.point[1],
        display_coordinates: true
    }
    if ( !process.env.HIDE_TWEETS)
        tweeter.tweet(tweet);
}

async function getImage(url) {
    return new Promise((resolve, reject) => {
        curl.enable(CurlFeature.Raw)
        curl.setOpt('URL', url)
        curl.on('end', (statusCode, body, headers, curlInstance) => {
            console.info('Status Code: ', statusCode)
            console.info('Headers: ', headers)
            console.info('Body length: ', body.length)
      
            // always close the `Curl` instance when you don't need it anymore
            // Keep in mind we can do multiple requests with the same `Curl` instance
            //  before it's closed, we just need to set new options if needed
            //  and call `.perform()` again.
            curl.close()
            resolve(body)
        })
        curl.perform()
    });
}

// function repostTweet(tweet) {
//     var media = tweet.extended_entities.media
//     console.log( media )
//     var mediaUrls = ""
//     media.forEach(m => {
//         mediaUrls += m.display_url + " "
//     });
//     mediaUrls = mediaUrls.trim()
//     console.log(mediaUrls)

//     client.post("statuses/update", { status: mediaUrls })
//         .then((newTweet) => {
//             console.log( "Tweeted! " + newTweet.id_str )
//             client.post("favorites/create", { id: tweet.id_str, include_entities: false } )
//                 .then((favedTweet) => {
//                     console.log( "Faved " + favedTweet.id_str )
//                 })
//                 .catch((error) => console.error(error) )
//         })
//         .catch((error) => console.error(error) )
// }

// function getRandomTweet(userId, callback) {
//     client.get("statuses/user_timeline", { user_id: userId, count: 200, trim_user: 1, exclude_replies: 1, include_rts: 0 })
//         .then((tweets) => {
//             if (tweets.length == 0)
//                 callback();
//             else {
//                 var tweet
//                 var attempts = tweets.length
//                 do {
//                     tweet = tweets[Math.floor(Math.random() * tweets.length)]
//                     attempts--
//                 } while ( attempts > 0 && ( !tweet.hasOwnProperty('extended_entities') || tweet.extended_entities.media.length == 0) )
//                 if (attempts == 0)
//                     callback();
                
//                 callback(tweet);
//             }
//         });
// }

// function getRandomTweetFromRandomUser(users, callback) {
//     var randomUser = users[Math.floor(Math.random() * users.length)];
//     console.log(randomUser.name)
//     getRandomTweet(randomUser.id_str, (tweet) => {
//         if (tweet == undefined)
//             getRandomTweetFromRandomUser(users, callback)
//         else
//             callback(tweet)
//     });
// }

// function findUsers(page, callback) {
//     client.get("users/search", { q: "no context", page: page, count: 20, include_entities: "false" })
//         .then((users) => {
//             console.log(page + " " + users.length)
//             if (users.length == 0) {
//                 callback(users);
//             }
//             else {
//                 findUsers(page + 1, (moreUsers) => {
//                     callback(users.concat( moreUsers ))
//                 });
//             }
//         })
//         .catch((error) => {
//             console.log(error)
//             callback([])
//         })
// }
/*
curl -u 'IpOcNBTYuM3FA5phhGmyZOodS:WQl5cn8lgKoyJC4BqpcEAQtaKpUZJSRF4tcLcwT0YDUeNCVq0F'   --data 'grant_type=client_credentials'   'https://api.twitter.com/oauth2/token'
*/