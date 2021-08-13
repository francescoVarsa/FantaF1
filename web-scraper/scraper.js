const axios = require('axios')
const cheerio = require('cheerio');
const fs = require('fs')

class Scraper {
    getTurnResults = (url, raceName, raceID) => {
        let dataArray = []
        let results = {
            id: raceID,
            raceName: raceName,
            raceResults: [],
            startingGrid: [],
            qualifyngSession: {
                Q1: [],
                Q2: [],
                Q3: [],
            },
            freePractice: {
                turn1: [],
                turn2: [],
                turn3: [],
            }
        }

        return axios.get(url)
        .then((response) => {
            const $ = cheerio.load(response.data)
            const dataTable = $(".ftbl__top-drivers__body")
            const tableRow = dataTable.find('.ftbl__top-drivers__body-cell-span > a')
            tableRow.each((i, element) => {
                dataArray.push($(element).text())
            })
            const raceChunkSize = 40
            const qualifyng3ChunkSize = 20
            const qualifyng2ChunkSize = 30

            const allStaanding = this.sliceIntoChunks(dataArray, raceChunkSize, 0)
            const raceResults = allStaanding[0]
            const startingGrid = allStaanding[1]
            const dataQ3 = this.sliceIntoChunks(dataArray, qualifyng3ChunkSize, 80)
            const dataQ2 = this.sliceIntoChunks(dataArray, qualifyng2ChunkSize, 100)
            const dataQ1 = this.sliceIntoChunks(dataArray, raceChunkSize, 130)
            const freePracticeData = this.sliceIntoChunks(dataArray, raceChunkSize, 170)

            const Q3results = dataQ3[0]
            const Q2results = dataQ2[0]
            const Q1results = dataQ1[0]
            const freePractice3 = freePracticeData[0]
            const freePractice2 = freePracticeData[1]
            const freePractice1 = freePracticeData[2]

            results.raceResults = this.arrayReducer(raceResults)
            results.startingGrid = this.arrayReducer(startingGrid)
            results.qualifyngSession.Q1 = this.arrayReducer(Q1results)
            results.qualifyngSession.Q2 = this.arrayReducer(Q2results)
            results.qualifyngSession.Q3 = this.arrayReducer(Q3results)
            results.freePractice.turn1 = this.arrayReducer(freePractice1)
            results.freePractice.turn2 = this.arrayReducer(freePractice2)
            results.freePractice.turn3 = this.arrayReducer(freePractice3)

            return results
        })
        .catch((error) => {
            console.log(error);
        });
    }

    getSeasonCalendar = (url) => {
        let listGP = []
        let dateGP = []
        let calendar = []

        return axios.get(url)
        .then((response) => {
            const $ = cheerio.load(response.data)
            const calendarTableData = $('.ftbl__motorsports-calendar-body > tr > td > a')
            calendarTableData.each((i, el) => {
                const turn = $(el).text()
                listGP.push(turn)
            })

            const dateList = $('.ftbl__motorsports-calendar-row__cell-date')
            dateList.each((i, el) => {
                const dates = ($(el).text())
                dateGP.push(dates)
            })

            if(listGP.length === dateGP.length) {
                listGP.forEach((gp, i) => {
                    const turn = {
                        date: dateGP[i],
                        gpName: gp
                    }

                    calendar.push(turn)
                })
            }
            return calendar
        })
    }

    sliceIntoChunks = (arr, chunkSize, stratingIndex) => {
        const res = [];
        if(arr) {
            for (let i = stratingIndex; i < arr.length; i += chunkSize) {
                const chunk = arr.slice(i, i + chunkSize)
                res.push(chunk)
            }
        }
        return res;
    }

    arrayReducer = (arr) => {
        let result = []
        let pilotInfo = {}
        const formattedArray = this.sliceIntoChunks(arr, 2, 0)
        formattedArray.forEach((item, index) => {
            item.reduce((pilot, team) => {
                return pilotInfo = {
                    place: index + 1,
                    team,
                    pilot
                }
            })
            result.push(pilotInfo)
        })
        return result
    }
}

class WriteData extends Scraper {
    constructor() {
        super();
    }

    resultsFile = {}
    seasonCalendar = 'https://sport.sky.it/formula-1/calendario'

    gpUrls = {
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

    data = {
        GP: [],
    }

    init = () => {
        Object.entries(this.gpUrls).forEach(([key, value], index) => {
            const raceID = index + 1
            const raceName = key
            this.getDataGP(value, raceName, raceID)
                .then((res) => {
                    fs.writeFile('results.json', JSON.stringify(res, null, 2), (err) => {
                            if (err) console.log(err)
                            console.log(`====> ${raceName} results were saved`)
                        }
                    )
                })
                .then(() => this.insertCalendar(this.seasonCalendar))
                .catch((err) => console.log(err))
        })
    }

    getDataGP = (url, raceName, raceID) => {
        return this.getTurnResults(url, raceName, raceID)
            .then((res) => {
                this.data.GP.push(res)
                this.data.GP.sort((it, el) => it.id - el.id)
                return this.data
            })
    }

    insertCalendar = (url) => {
        return this.getSeasonCalendar(url)
            .then((res) => {
                this.resultsFile = require('./results.json')
                this.resultsFile['calendar'] = res
                fs.writeFile('./results.json', JSON.stringify(this.resultsFile, null, 2), (err) => {
                        if (err) console.log(err)
                    }
                )
            })
    }
}

module.exports = WriteData



