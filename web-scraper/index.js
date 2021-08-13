const WriteData = require('./scraper')
const schedule = require('node-schedule')

const saveData = new WriteData()

schedule.scheduleJob('0 0 * * *', () => saveData.init())


