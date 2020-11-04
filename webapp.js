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

  
app.get('/image/:stepnumber', async (req, res) => {
    if (req.params.stepnumber === undefined )
        throw new Error('Need to provide a step number')
    
    var lastImage = await images.getImageAtStep( req.params.stepnumber )
    res.json( lastImage )
})
  
app.get('/:routename/image/:stepnumber', async (req, res) => {
    if (req.params.stepnumber === undefined )
        throw new Error('Need to provide a step number')
    
    var lastImage = await images.getImageAtStep( req.params.stepnumber, req.params.routename )
    res.json( lastImage )
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});