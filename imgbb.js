const ImgBB = require('imgbbjs');
const Imgbb = require('imgbbjs');
const imgbb = new Imgbb({
  key: process.env.IMGBB_API_KEY,
});


exports.uploadImg = async (imgBuffer, filename) => {
    const imageRes = await imgbb.upload(imgBuffer.toString('base64'), filename)
    console.log( "Uploaded image to " + imageRes.data.url )
    return imageRes.data.url
}