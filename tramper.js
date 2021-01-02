var images = require('./imagecontroller')
var maps = require('./maps')
const imgbb = require('./imgbb')
const streetview= require('streetview');

const sv = new streetview({ api_key: process.env.GOOGLE_API_KEY })
const walkMetresPerSecond = 1
const walkIncrementMetres= 10 * 60 * walkMetresPerSecond

exports.updateTramp = async () => {
  var starttime = await images.getStartTime()
  var walkToDistance = (Date.now() - starttime.getTime()) / 1000 * walkMetresPerSecond

  var stepNumber = 1
  var walkedDistance = 0
  var lastImage = await images.getLastImageInfo()
  if (lastImage !== undefined) {
    walkedDistance = lastImage.distance + walkIncrementMetres
    stepNumber = lastImage.stepnumber + 1
  }

  console.log("Walked: " + walkedDistance + " Walk to: " + walkToDistance)
  while (walkedDistance <= walkToDistance) {
    console.log("Getting street view at " + walkedDistance)
    const imageAtDist = await saveNextStreetViewImage(walkedDistance, starttime, stepNumber)
    walkedDistance = imageAtDist.distance + walkIncrementMetres
    stepNumber++
  }
}

// exports.testmap = async (fromDistance) => {
//   console.log( "Finding streetview image at " + fromDistance)
//   var route = await images.getRoute()
//   var point = maps.getPointOnLeg(route.routes[0].legs[0], fromDistance)
//   console.log( point )
//     var metadata = await sv.metadata( {
//       lat: point[0],
//       lng: point[1]
//     } )
//     if ( metadata.status != 'OK' ) {
//       console.log( "No street view at " + fromDistance + ", going further" )
//       return this.testmap( fromDistance + 1000, 1000)
//     }
//     else {
//       var lookAheadPoint = maps.getPointOnLeg(route.routes[0].legs[0], fromDistance + 10)

//       // calc bearing to look forward
//       var radLat1 = point[0] * Math.PI / 180
//       var radLong1 = point[1] * Math.PI / 180
//       var radLat2 = lookAheadPoint[0] * Math.PI / 180
//       var radLong2 = lookAheadPoint[1] * Math.PI / 180
//       const y = Math.sin(radLong2-radLong1) * Math.cos(radLat2);
//       const x = Math.cos(radLat1)*Math.sin(radLat2) -
//                 Math.sin(radLat1)*Math.cos(radLat2)*Math.cos(radLong2-radLong1);
//       const θ = Math.atan2(y, x);

//       var brng = (θ * 180 / Math.PI + 360) % 360; // in degrees
//       console.log( `Getting street view at ${point[0]}, ${point[1]} looking ${brng}` )
//       brng += ( Math.random() * 180 - 90 ) // random turn up to 90deg

//       const path = maps.getPathsOverDistance( route.routes[0].legs[0], fromDistance - 30000, fromDistance + 30000, 600 )
//       maps.getMapAtPoint( point[0], point[1], path )
//     }

// }

async function findNextStreetviewImage(fromDistance, incrementBy) {
  console.log( "Finding streetview image at " + fromDistance)
  var route = await images.getRoute()

  var leg
  var distanceOnLeg = fromDistance
  for (leg = 0; leg < route.routes[0].legs.length; leg++) {
    var legLength = route.routes[0].legs[leg].distance.value
    console.log( "Leg " + leg + " : length: " + legLength)
    if (legLength > distanceOnLeg) {
      break;
    }
    distanceOnLeg -= legLength;
  }

  var point = maps.getPointOnLeg(route.routes[0].legs[leg], distanceOnLeg)
  console.log(`Point at ${distanceOnLeg} on leg ${leg}: ${point}`)
  
  var metadata = await sv.metadata( {
    lat: point[0],
    lng: point[1]
  } )
  if ( metadata.status != 'OK' ) {
    console.log( "No street view at " + fromDistance + ", going further" )
    return findNextStreetviewImage( fromDistance + incrementBy, incrementBy)
  }
  else {
    var lookAheadPoint = maps.getPointOnLeg(route.routes[0].legs[leg], distanceOnLeg + 10)

    // calc bearing to look forward
    var radLat1 = point[0] * Math.PI / 180
    var radLong1 = point[1] * Math.PI / 180
    var radLat2 = lookAheadPoint[0] * Math.PI / 180
    var radLong2 = lookAheadPoint[1] * Math.PI / 180
    const y = Math.sin(radLong2-radLong1) * Math.cos(radLat2);
    const x = Math.cos(radLat1)*Math.sin(radLat2) -
              Math.sin(radLat1)*Math.cos(radLat2)*Math.cos(radLong2-radLong1);
    const θ = Math.atan2(y, x);

    var brng = (θ * 180 / Math.PI + 360) % 360; // in degrees
    console.log( `Getting street view at ${point[0]}, ${point[1]} looking ${brng}` )
    brng += ( Math.random() * 100 - 50 ) // random turn up to 50deg

    const path = maps.getPathsOverDistance( route.routes[0].legs[leg], distanceOnLeg - 20000, distanceOnLeg + 20000, 1000 )
    
    return {
      distance: fromDistance, 
      point: point,
      image: await sv.image( {
        lat: point[0],
        lng: point[1],
        size: [1024, 1024],
        heading: brng
      }),
      map: await maps.getMapAtPoint( point[0], point[1], path )    
    }
  }
}
  
  async function saveNextStreetViewImage(atDist, starttime, stepNumber) {
    try {
      const res = await findNextStreetviewImage(atDist, 50)
      atDist = res.distance
      var time = new Date( starttime.getTime() + (atDist / walkMetresPerSecond) * 1000)
      var filename = `streetview_${atDist}_${Math.round(time.getTime() / 1000)}`
      var url = await imgbb.uploadImg(res.image, filename)

      var mapfilename = `map_${atDist}_${Math.round(time.getTime() / 1000)}`
      var mapurl = await imgbb.uploadImg(res.map, mapfilename)
      
      exports.lastUploadedImage = res.image
      
      var newImage = { filename: filename, time: time, distance: atDist, point: res.point, url: url, mapurl: mapurl, stepnumber: stepNumber }
      images.setImageInfo( newImage )
      return newImage
    }
    catch ( e ) {
      console.error(e);
    }
  }