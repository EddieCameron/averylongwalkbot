const db = require('./db')

changeStartTime = async (seconds) => {
    const routename = process.env.CURRENT_ROUTENAME;

    var starttime = await db.query("SELECT starttime FROM routes WHERE routename=$1", routename)
    console.log( starttime)
    if (starttime.length > 0 && starttime[0].starttime != null) {
        var adjustedTime = new Date(starttime[0].starttime.getTime() + seconds * 1000);
        console.log( adjustedTime )
        await db.query("UPDATE routes SET starttime=$1 WHERE routename=$2", adjustedTime, routename)
    }
}

var seconds = +process.argv[process.argv.length - 1];
changeStartTime( seconds )

