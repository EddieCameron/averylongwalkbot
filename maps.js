const {Client, Util} = require("@googlemaps/google-maps-services-js");
const qs = require( 'querystring' )
const fs = require('fs');

const client = new Client({})

const bent = require('bent');

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
  
function encodePath(path) {
  var result = [];
  var start = [0, 0];
  var end;

  var encodePart = function(part) {
    part = part < 0 ? ~(part << 1) : part << 1;
    while (part >= 0x20) {
      result.push(String.fromCharCode((0x20 | (part & 0x1f)) + 63));
      part >>= 5;
    }
    result.push(String.fromCharCode(part + 63));
  };

  for (let i = 0, I = path.length || 0; i < I; ++i) {
    end = [Math.round(path[i].lat * 1e5), Math.round(path[i].lng * 1e5)];
    encodePart(end[0] - start[0]); // lat
    encodePart(end[1] - start[1]); // lng
    start = end;
  }

  return result.join("");
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

exports.getPathsOverDistance = (leg, startDistance, endDistance, minPointDist) => {
  var runningDist = 0
  var path = []
  for (const step of leg.steps) {
    if (runningDist > endDistance) {
      break
    }

    if (step.distance !== undefined) {
      let stepLength = step.distance.value
      runningDist += stepLength
    }

    if (runningDist >= startDistance) {
      const decodedPath = decodePath(step.polyline.points)
      for (const point of decodedPath) {
        if (path.length > 0) {
          const lastPoint = path[path.length - 1]
          var d = distance(lastPoint.lat, lastPoint.lng, point.lat, point.lng)
          if (d < minPointDist)
            continue
        }

        var roundedPoint = {lat: Math.round( point.lat * 1000 ) / 1000, lng: Math.round( point.lng * 1000 ) / 1000 }
        path.push(roundedPoint)
      }
    }
  }
  return encodePath( path )
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

const staticMapsRequest = bent( 'buffer', `https://maps.googleapis.com/maps/api/staticmap?key=${process.env.GOOGLE_API_KEY}&` )

exports.getMapAtPoint = async function (lat, long, path) {
  console.log( path )
  const mapParams = {
    center: `${lat},${long}`,
    zoom: 10,
    size: '512x512',
    maptype: 'terrain',
    markers: `color:orange|size:tiny|${lat},${long}`,
    path:`color:orange|enc:${path}`
  }
  
  return staticMapsRequest(qs.stringify(mapParams))
}
