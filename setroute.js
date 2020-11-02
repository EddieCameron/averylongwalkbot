const { setRoute } = require("./imagecontroller");
const {Client, Util} = require("@googlemaps/google-maps-services-js");
const client = new Client({})

exports.getDirs = async () => {
    try {
        const res = await client.directions( { params: {
            origin: {lat: 31.000003,lng: 130.664633 },
            destination: { lat: 45.522284, lng: 141.936580 },
            waypoints: [ {lat: 35.679824, lng: 139.768652 } ],
            key: process.env.GOOGLE_API_KEY,
            avoid: "highways",
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