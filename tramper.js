var images = require('./imagecontroller')
var maps = require('./maps')
const imgbb = require('./imgbb')
const streetview= require('streetview');

const sv = new streetview({ api_key: process.env.GOOGLE_API_KEY })
const walkIncrementMetres= 10 * 60 * 1.4
const walkMetresPerSecond = 1.4

exports.updateTramp = async () => {
  var starttime = await images.getStartTime()
  var walkToDistance = (Date.now() - starttime.getTime()) / 1000 * walkMetresPerSecond

  var walkedDistance = 0
  var lastImage = await images.getLastImageInfo()
  if (lastImage !== undefined) {
    walkedDistance = lastImage.distance + walkIncrementMetres
  }

  console.log("Walked: " + walkedDistance + " Walk to: " + walkToDistance)
  while (walkedDistance <= walkToDistance) {
    console.log("Getting street view at " + walkedDistance)
    const imageAtDist = await saveNextStreetViewImage(walkedDistance, starttime)
    walkedDistance = imageAtDist.distance + walkIncrementMetres
  }
}

async function findNextStreetviewImage(fromDistance, incrementBy) {
    console.log( "Finding streetview image at " + fromDistance)
  var route = await images.getRoute()
  var point = maps.getPointOnLeg(route.routes[0].legs[0], fromDistance)
  console.log( point )
    var metadata = await sv.metadata( {
      lat: point[0],
      lng: point[1]
    } )
    if ( metadata.status != 'OK' ) {
      console.log( "No street view at " + fromDistance + ", going further" )
      return findNextStreetviewImage( fromDistance + incrementBy, incrementBy)
    }
    else {
      return {
        distance: fromDistance, 
        point: point,
        image: await sv.image( {
          lat: point[0],
          lng: point[1],
          size: [1024, 1024],
          heading: Math.random() * 360
        } )
      }
    }
  }
  
  async function saveNextStreetViewImage(atDist, starttime) {
    try {
      const res = await findNextStreetviewImage(atDist, 50)
      atDist = res.distance
      var time = new Date( starttime.getTime() + (atDist / walkMetresPerSecond) * 1000)
      var filename = `streetview_${atDist}_${Math.round(time.getTime() / 1000)}`
      var url = await imgbb.uploadImg(res.image, filename )
      
      var newImage = { filename: filename, time: time, distance: atDist, point: res.point, url: url }
      images.setImageInfo( newImage )
      return newImage
    }
    catch ( e ) {
      console.error(e);
    }
  }