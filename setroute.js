const { setRoute } = require("./imagecontroller");
const {Client, Util} = require("@googlemaps/google-maps-services-js");
const client = new Client({})

exports.getDirs = async () => {
    try {
        const res = await client.directions({
            params: {
                origin: { lat: 12.3248856, lng: -71.724106 },
                waypoints: [
                    { lat: -40.573939, lng: -73.15923 }
                    // {
                    //     location: { lat: -40.573939, lng: -73.15923 },
                    //     stopover: false
                    // }
                ],
                destination: { lat: -53.64266, lng: -70.9532977 },
                key: process.env.GOOGLE_API_KEY
                //avoid: "highways"
                // units: "metric",
        } })
        console.log( 'status: ' + res.status )

        setRoute(res.data)
        console.log("Added: " + JSON.stringify(res.data));
    }
    catch ( e ) {
        console.error(e);
    }
};
exports.getDirs();