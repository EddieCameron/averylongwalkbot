const { setRoute } = require("./imagecontroller");
const {Client, Util} = require("@googlemaps/google-maps-services-js");
const client = new Client({})

exports.getDirs = async () => {
    try {
        const res = await client.directions({
            params: {
            origin: {lat: 42.418435,lng: 130.643810 },
            destination: { lat: 38.780430, lng: -9.498994 },
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