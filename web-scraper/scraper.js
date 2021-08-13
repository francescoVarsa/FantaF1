const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const moment = require('moment')

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

                if (listGP.length === dateGP.length) {
                    listGP.forEach((gp, i) => {
                        const raceDate = dateGP[i].substring(dateGP[i].indexOf("-") + 1);
                        const gpDate = raceDate + " 2021"
                        const dateFormat = "DD/MMM"
                        const localeData = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
                        moment.updateLocale('it', {
                            monthsShort: localeData
                        })
                        const gpDateFormatted = moment(gpDate, dateFormat).format('L')
                        const turn = {
                            date: gpDateFormatted,
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
        if (arr) {
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

    resultsFile
    seasonCalendar = 'https://sport.sky.it/formula-1/calendario'

    gpUrls = {
        GP_Bahrain: 'https://sport.sky.it/formula-1/gp/granpremio-bahrain/risultati',
        GP_Emilia_Romagna: 'https://sport.sky.it/formula-1/gp/granpremio-emilia-romagna/risultati',
        GP_Portogallo: 'https://sport.sky.it/formula-1/gp/granpremio-portogallo/risultati',
        GP_Spagna: 'https://sport.sky.it/formula-1/gp/granpremio-spagna/risultati',
        GP_Monaco: 'https://sport.sky.it/formula-1/gp/granpremio-monaco/risultati',
        GP_Azerbaijan: 'https://sport.sky.it/formula-1/gp/granpremio-azerbaijan/risultati',
        GP_Francia: 'https://sport.sky.it/formula-1/gp/granpremio-francia/risultati',
        GP_Stiria: 'https://sport.sky.it/formula-1/gp/granpremio-stiria/risultati',
        GP_Austria: 'https://sport.sky.it/formula-1/gp/granpremio-austria/risultati',
        GP_Gran_Bretagna: 'https://sport.sky.it/formula-1/gp/granpremio-gran-bretagna/risultati',
        GP_Ungheria: 'https://sport.sky.it/formula-1/risultati',
        GP_Belgio: 'https://sport.sky.it/formula-1/gp/granpremio-belgio/risultati',
        GP_Olanda: 'https://sport.sky.it/formula-1/gp/granpremio-olanda/risultati',
        GP_Italia: 'https://sport.sky.it/formula-1/gp/granpremio-italia/risultati',
        GP_Russia: 'https://sport.sky.it/formula-1/gp/granpremio-russia/risultati',
        GP_Turchia: 'https://sport.sky.it/formula-1/gp/granpremio-turchia/risultati',
        GP_Giappone: 'https://sport.sky.it/formula-1/gp/granpremio-giappone/risultati',
        GP_Stati_Uniti: 'https://sport.sky.it/formula-1/gp/granpremio-stati-uniti/risultati',
        GP_Messico: 'https://sport.sky.it/formula-1/gp/granpremio-messico/risultati',
        GP_Brasile: 'https://sport.sky.it/formula-1/gp/granpremio-brasile/risultati',
        GP_Arabia_Saudita: 'https://sport.sky.it/formula-1/gp/granpremio-arabia-saudita/risultati',
        GP_Abu_Dhabi: 'https://sport.sky.it/formula-1/gp/granpremio-abu-dhabi/risultati'
    }

    data = {
        GP: [],
    }

    init = () => {
        const now = moment().locale('it').format('L')
        const format = 'DD-MM-YYYY'
        console.log(`starting checking for updates ${now}`)
        this.getSeasonCalendar(this.seasonCalendar)
            .then((res) => {
                const racedGPs = res.filter((gp) => {
                    return moment(gp.date, format).isSameOrBefore(moment(now, format))
                })
                return racedGPs
            })
            .then((res) => {
                const urls = []
                res.forEach((gpDate, index) => {
                    const whiteSpacePattern = /\s/g
                    const formattedGPNames = gpDate.gpName.replace(whiteSpacePattern, "_")
                    if (formattedGPNames in this.gpUrls) {
                        const raceID = index + 1
                        const raceName = formattedGPNames
                        this.getDataGP(this.gpUrls[formattedGPNames], raceName, raceID)
                            .then((res) => {
                                fs.writeFile('results.json', JSON.stringify(res, null, 2), (err) => {
                                        if (err) console.log(err)
                                        console.log(`====> ${raceName} results were saved`)
                                    }
                                )
                            })
                            .then(() => this.insertCalendar(this.seasonCalendar))
                            .catch((err) => console.log(err))
                    }
                })
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



