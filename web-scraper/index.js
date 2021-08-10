const scraper = require('./scraper')

const hungarianGP = 'https://sport.sky.it/formula-1/risultati'
const silverstoneGP = 'https://sport.sky.it/formula-1/gp/granpremio-gran-bretagna/risultati'
const dataGP = scraper.getTurnResults(silverstoneGP)
dataGP.then(res => console.log(res.raceResults))