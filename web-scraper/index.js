const WriteData = require('./scraper')

const saveData = new WriteData()
const now = new Date()
const delay = 60000 - (now % 60000)

setTimeout(saveData.init, delay)


