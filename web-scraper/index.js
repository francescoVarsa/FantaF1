const scraper = require('./scraper')
const fs = require('fs')
const Scraper = require('./scraper')
let resultsFile = require('./results.json')

const gpUrls = {
    baharain: 'https://sport.sky.it/formula-1/gp/granpremio-bahrain/risultati',
    imolaGP: 'https://sport.sky.it/formula-1/gp/granpremio-emilia-romagna/risultati',
    portugalGP: 'https://sport.sky.it/formula-1/gp/granpremio-portogallo/risultati',
    barcelonaGP: 'https://sport.sky.it/formula-1/gp/granpremio-spagna/risultati',
    monacoGP: 'https://sport.sky.it/formula-1/gp/granpremio-monaco/risultati',
    azerbaijanGP: 'https://sport.sky.it/formula-1/gp/granpremio-azerbaijan/risultati',
    franceGP: 'https://sport.sky.it/formula-1/gp/granpremio-francia/risultati',
    stiriaGP: 'https://sport.sky.it/formula-1/gp/granpremio-stiria/risultati',
    redBullRing: 'https://sport.sky.it/formula-1/gp/granpremio-austria/risultati',
    silverstoneGP: 'https://sport.sky.it/formula-1/gp/granpremio-gran-bretagna/risultati',
    hungarianGP: 'https://sport.sky.it/formula-1/risultati',
    spaGP: 'https://sport.sky.it/formula-1/gp/granpremio-belgio/risultati',
    zandvoortGP: 'https://sport.sky.it/formula-1/gp/granpremio-olanda/risultati',
    monzaGP: 'https://sport.sky.it/formula-1/gp/granpremio-italia/risultati',
    russianGP: 'https://sport.sky.it/formula-1/gp/granpremio-russia/risultati',
    turkishGP: 'https://sport.sky.it/formula-1/gp/granpremio-turchia/risultati',
    suzukaGP: 'https://sport.sky.it/formula-1/gp/granpremio-giappone/risultati',
    usaGP: 'https://sport.sky.it/formula-1/gp/granpremio-stati-uniti/risultati',
    mexicanGP: 'https://sport.sky.it/formula-1/gp/granpremio-messico/risultati',
    brasilGP: 'https://sport.sky.it/formula-1/gp/granpremio-brasile/risultati',
    arabianGP: 'https://sport.sky.it/formula-1/gp/granpremio-arabia-saudita/risultati',
    abuDhabiGP: 'https://sport.sky.it/formula-1/gp/granpremio-abu-dhabi/risultati'
}

const seasonCalendar = 'https://sport.sky.it/formula-1/calendario'
let data = {
    GP: [],
}

const getDataGP = (url, key) => {
        return scraper.getTurnResults(url)
            .then((res) => {
                data.GP.push({[key]: res})
                return data
            })
        }

Object.entries(gpUrls).forEach(([key, value]) => {
    getDataGP(value, key)
    .then((res) => {
        fs.writeFile('results.json', JSON.stringify(res, null, 2), (err) => {
        if (err) console.log(err)
        insertCalendar(seasonCalendar)
        console.log(resultsFile.GP.length, resultsFile.calendar.length)
    }
    )
})
    .catch((err) => console.log(err))
})

const insertCalendar = (url) => {
    return Scraper.getSeasonCalendar(url)
    .then((res) => {
        resultsFile['calendar'] = res
        fs.writeFile('./results.json', JSON.stringify(resultsFile, null, 2), (err) => {
            if (err) console.log(err)
        }
        )
    })
}
