const db = require('./db')

exports.setRoute = ( route ) => {
    return db.query("INSERT INTO routes(routejson) VALUES($1)", JSON.stringify(route))
}

exports.getRoute = async () => {
    var allRoutes = await db.query("SELECT routejson FROM routes")
    try {
        console.log("parsing")
        var route = JSON.parse(allRoutes[0].routejson)
        console.log("parsed")
        return route
    }
    catch (e) {
        console.error(e)
    }
}

exports.getStartTime = async () => {
    var starttime = await db.query("SELECT starttime FROM routes")
    console.log( starttime)
    if (starttime.length == 0 || starttime[0].starttime == null) {
        var now = new Date()
        console.log( now)
        await db.query("UPDATE routes SET starttime=$1", now)
        return now
    }
    return starttime[0].starttime
}

exports.getLastImageInfo = async () => {
    var images = await db.query("SELECT * FROM images ORDER BY idx desc LIMIT 1")
    if (images.length == 0)
        return undefined;
    else
        return images[0];
}

exports.setImageInfo = (image) => {
    return db.query("INSERT INTO images(filename, time, distance, lat, long, url) VALUES($1, $2, $3, $4, $5, $6)",
        image.filename, image.time, image.distance, image.point[0], image.point[1], image.url);
}

exports.getImageAtIdx = async imageIdx => {
    var firstIdx = await db.query("SELECT idx FROM images ORDER BY idx asc LIMIT 1")
    var lastIdx = await db.query("SELECT idx FROM images ORDER BY idx desc LIMIT 1")
    if ( imageIdx < firstIdx )
        imageIdx = firstIdx
    if (imageIdx > lastIdx )
        imageIdx = lastIdx
    
    var images = await db.query("SELECT * FROM images WHERE idx=$1", imageIdx)
    return images[0]
}

// exports.resetpath = () => {
//     db.set( 'images', [] )
//         .write()
// }