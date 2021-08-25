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
  }
}