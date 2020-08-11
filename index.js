const tweeter = require('./tweeter')
const tramper= require("./tramper")

var images = require('./imagecontroller')
var db = require( './db')

// // auth
// const UserAuth = require("./userauth.js");
// UserAuth.config({ consumer_key: process.env.TWITTER_CONSUMER_KEY, consumer_secret: process.env.TWITTER_CONSUMER_SECRET })

// UserAuth.getusertoken( function (token, secret) {
//     console.log(token);
//     console.log(secret);
// })

// get data from glitch
// getGlitchData()
//     .catch(console.error)
    
// async function getGlitchData() {
//     const { statusCode, data, headers } = await curly.get('https://tramper.glitch.me/getdata')
//     var jsonData = JSON.parse(data)
//     //await db.query("INSERT INTO routes(routejson) VALUES($1)", JSON.stringify(jsonData.route))
//     console.log( jsonData.images )

//     for (const image of jsonData.images) {
//         console.log( image )
//         await db.query("INSERT INTO images(filename, time, distance, lat, long) VALUES($1, $2, $3, $4, $5)", image.filename, image.time, image.distance, image.point[0], image.point[1]);
//     }
// }

// run every 10 mins
update()

async function update() {
    try {
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
            await makeATweet();
        }
        else {
            console.log("not long enough since last tweet")
        }
    }
    catch (e) {
        console.error(e)
    }
    finally {
        await db.close()
    }
}
async function updateTramp() {
    await tramper.updateTramp();
}

async function makeATweet() {
    console.log('tweet')
    var lastImage = await images.getLastImageInfo()
    if (lastImage === undefined)
        return;
    
    console.log("Tweeting: " + lastImage)
    
    var tweet = {
        status: encodeURI('https://tramper.glitch.me/step/' + lastImage.idx),
        lat: lastImage.lat,
        long: lastImage.long,
        display_coordinates: true
    }
    if ( !process.env.HIDE_TWEETS)
        tweeter.tweet(tweet);
    else
        console.log( tweet )
}

// CREATE TABLE images(
//     idx SERIAL,
//     filename VARCHAR,
//     time INTEGER,
//     distance REAL,
//     lat DOUBLE PRECISION,
//     long DOUBLE PRECISION
// );