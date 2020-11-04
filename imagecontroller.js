const db = require('./db')

exports.setRoute = async (route) => {
    const routename = process.env.CURRENT_ROUTENAME;

    try {
        var starttime = await db.query("SELECT starttime FROM routes WHERE routename=$1", routename)
        if (starttime.length == 0 || starttime[0].starttime == null) {
            await db.query("INSERT INTO routes(routejson, routename) VALUES($1, $2)", JSON.stringify(route), routename)
        }
        else {
            await db.query("UPDATE routes SET routejson=$1 WHERE routename=$2", JSON.stringify(route), routename)
        }
    }
    catch (e) {
        console.error(e);
    }
}

exports.getRoute = async () => {
    const routename = process.env.CURRENT_ROUTENAME;
    var allRoutes = await db.query("SELECT routejson FROM routes WHERE routename=$1", routename)
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
    const routename = process.env.CURRENT_ROUTENAME;

    var starttime = await db.query("SELECT starttime FROM routes WHERE routename=$1", routename)
    console.log( starttime)
    if (starttime.length == 0 || starttime[0].starttime == null) {
        var now = new Date()
        console.log( now)
        await db.query("UPDATE routes SET starttime=$1 WHERE routename=$2", now, routename)
        return now
    }
    return starttime[0].starttime
}

exports.getLastImageInfo = async (routename) => {
    if (routename === undefined)
        routename = process.env.CURRENT_ROUTENAME;
    
    var images = await db.query("SELECT * FROM images WHERE routename=$1 ORDER BY idx desc LIMIT 1", routename)
    if (images.length == 0)
        return undefined;
    else
        return images[0];
}

exports.setImageInfo = (image) => {
    const routename = process.env.CURRENT_ROUTENAME;

    return db.query("INSERT INTO images(filename, time, distance, lat, long, url, mapurl, routename,stepnumber) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        image.filename, image.time, image.distance, image.point[0], image.point[1], image.url, image.mapurl, routename, image.stepnumber);
}

exports.getAllImages = async () => {
    const routename = process.env.CURRENT_ROUTENAME;
    return db.query( "SELECT url FROM images WHERE routename=$1 ORDER BY idx ASC", routename )
}

// exports.resetpath = () => {
//     db.set( 'images', [] )
//         .write()
// }

exports.getImageAtStep = async (stepnumber, routename) => {
    if (routename === undefined)
        routename = process.env.CURRENT_ROUTENAME;
    
    var firstIdx = ( await db.query("SELECT stepnumber FROM images WHERE routename=$1 ORDER BY stepnumber asc LIMIT 1", routename) )[0].idx
    var lastIdx = ( await db.query("SELECT stepnumber FROM images WHERE routename=$1 ORDER BY stepnumber desc LIMIT 1", routename ) )[0].idx
    if ( imageIdx < firstIdx )
        imageIdx = firstIdx
    if (imageIdx > lastIdx )
        imageIdx = lastIdx
    
    var images = await db.query("SELECT * FROM images WHERE stepnumber=$1 AND routename=$2", stepnumber, routename)
    return images[0]
}