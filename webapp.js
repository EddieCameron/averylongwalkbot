const morgan = require('morgan')
var express = require('express')
var images = require('./imagecontroller')
 
const app = express();

// Use morgan for HTTP request logging in dev and prod
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}
  
app.get('/latest', async (req, res) => {
    var lastImage = await images.getLastImageInfo()
    res.json( lastImage )
})
  
app.get('/:routename/latest', async (req, res) => {
    var lastImage = await images.getLastImageInfo( req.params.routename )
    res.json( lastImage )
})

  
app.get('/image/:imageidx', async (req, res) => {
    if (req.params.imageidx === undefined )
        throw new Error('Need to provide an image idx')
    
    var lastImage = await images.getImageAtIdx( req.params.imageidx )
    res.json( lastImage )
})
  
app.get('/:routename/image/:imageidx', async (req, res) => {
    if (req.params.imageidx === undefined )
        throw new Error('Need to provide an image idx')
    
    var lastImage = await images.getImageAtIdx( req.params.imageidx, req.params.routename )
    res.json( lastImage )
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});