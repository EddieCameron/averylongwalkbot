const {Client, Util} = require("@googlemaps/google-maps-services-js");
const db = require('./db.js')

const client = new Client({})

// exports.getDirs = async () => {
//     try {
//         const res = await client.directions( { params: {
//             origin: {lat: 70.2428161,lng: -148.3923203 },
//             destination: { lat: 13.8108272, lng: -90.2635695 },
//             key: process.env.GOOGLE_API_KEY
//             // avoid: "highways",
//             // units: "metric",
//         } })
//         console.log( 'status: ' + res.status )

//         db.setRoute( res.data )
//     }
//     catch ( e ) {
//         console.error(e);
//     }
// };

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  function decodePath(encodedPath) {
    let len = encodedPath.length || 0;
    let path = []
    let index = 0;
    let lat = 0;
    let lng = 0;
    let pointIndex;
  
    for (pointIndex = 0; index < len; ++pointIndex) {
      let result = 1;
      let shift = 0;
      let b;
      do {
        b = encodedPath.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lat += result & 1 ? ~(result >> 1) : result >> 1;
  
      result = 1;
      shift = 0;
      do {
        b = encodedPath.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lng += result & 1 ? ~(result >> 1) : result >> 1;
  
      path[pointIndex] = { lat: lat * 1e-5, lng: lng * 1e-5 };
    }
    path.length = pointIndex;
  
    return path;
  }

exports.getPointOnLeg = ( leg, atDist ) => {
    var runningDist = 0
    for (const step of leg.steps) {
        if ( step.distance === undefined )
            continue;

        let stepLength = step.distance.value
        console.log( "Step: " + stepLength )
        if ( atDist - runningDist > stepLength ) {
            runningDist += stepLength
            continue;
        }

        // interpolate point on step
        var stepLine = decodePath(step.polyline.points)
        var stepDist = 0
        var requiredStepDist = atDist - runningDist
        //console.log( "Remaining dist: " + requiredStepDist )
        for (let i = 1; i < stepLine.length; i++) {
            const p1 = stepLine[i];
            const p0 = stepLine[i-1];
            var d = distance( p0.lat, p0.lng, p1.lat, p1.lng)
          //  console.log( stepDist + "->" + p1.lat + ", " + p1.lng + " -> " + d )
            //console.log(d)
            if ( requiredStepDist - stepDist < d ) {
                // found the point on the step!
                // interpolate
                var normalizedDist = ( requiredStepDist - stepDist ) / d
                return [p0.lat + normalizedDist * (p1.lat - p0.lat), p0.lng + normalizedDist * (p1.lng - p0.lng)]
            }
            else {
                stepDist += d
            }
        }

    }
}

// AL 70.2428161,-148.3923203
// Guatemala 13.8108272,-90.2635695