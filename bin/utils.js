const { readdirSync, statSync } = require("fs")
const path = require("path")


module.exports = {
  waitFor: (process, frequency) => {
    return new Promise((resolve) => {
      let interval = setInterval(async () => {
        let over = await process()
        if(over) {
          clearInterval(interval)
          resolve()
        }
      }, frequency)
    })
  },
  getAllFiles: (dirPath, arrayOfFiles) => {
    arrayOfFiles = arrayOfFiles || []

    files = readdirSync(dirPath)
    files.forEach(function(file) {
      const stats = statSync(dirPath + "/" + file)
      if (stats.isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push({ path: path.join(dirPath, "/", file), size: stats.size })
      }
    })

    return arrayOfFiles
  }
}