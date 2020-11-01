const { getAllImages } = require("./imagecontroller");
const bent = require("bent")
var fs = require('fs');

const dir = "./images"        

async function saveImages() {
    var imageUrls = await getAllImages();

    const imgdownloader = bent("buffer")
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }


    let downloads = []
    for (let index = 0; index < imageUrls.length; index++) {
        const imageUrl = imageUrls[index].url;
        const filenameStart = imageUrl.lastIndexOf( "/" ) + 1
        const fileName = `${dir}/${index}-${imageUrl.substr(filenameStart)}`
        if (fs.existsSync(fileName))
            continue;
        
        downloads.push( downloadImg( imageUrl, fileName, imgdownloader ) )
    }

    console.log("Waiting for " + downloads.length + " images")
    let completed = 0
    downloads.forEach(download => {
        download.then(() => {
            completed++;
            console.log((completed / downloads.length) * 100 + "%");
        }
        )
        .catch(console.error);
    });

    await Promise.all(downloads);
    console.log("DONE!");
}

async function downloadImg(imageUrl, fileName, downloader) {
    console.log("Downloading..." + imageUrl);
    var imagebuffer = await downloader(imageUrl)
    console.log("Downloaded..." + imageUrl);
    return fs.promises.writeFile(fileName, imagebuffer);
}

function fixImages() {
    var files = fs.readdirSync(dir);
    for (const file of files) {
        var firstDashAt = file.indexOf('-');
        var numString = file.substr(0, firstDashAt);
        numString = ("00000" + numString).slice(-5)
        var newFile = numString + file.substr(firstDashAt)
        fs.renameSync( dir + "/" + file, dir + "/" + newFile);
    }
}