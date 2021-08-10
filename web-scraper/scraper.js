const axios = require('axios')
const cheerio = require('cheerio');

class Scraper {
    static getTurnResults = (url) => {
        let dataArray = []
        let results = {
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

            const allStaanding = this._sliceIntoChunks(dataArray, raceChunkSize, 0)
            const raceResults = allStaanding[0]
            const startingGrid = allStaanding[1]
            const dataQ3 = this._sliceIntoChunks(dataArray, qualifyng3ChunkSize, 80)
            const dataQ2 = this._sliceIntoChunks(dataArray, qualifyng2ChunkSize, 100)
            const dataQ1 = this._sliceIntoChunks(dataArray, raceChunkSize, 130)
            const freePracticeData = this._sliceIntoChunks(dataArray, raceChunkSize, 170)

            const Q3results = dataQ3[0]
            const Q2results = dataQ2[0]
            const Q1results = dataQ1[0]
            const freePractice3 = freePracticeData[0]
            const freePractice2 = freePracticeData[1]
            const freePractice1 = freePracticeData[2]

            results.raceResults = this._arrayReducer(raceResults)
            results.startingGrid = this._arrayReducer(startingGrid)
            results.qualifyngSession.Q1 = this._arrayReducer(Q1results)
            results.qualifyngSession.Q2 = this._arrayReducer(Q2results)
            results.qualifyngSession.Q3 = this._arrayReducer(Q3results)
            results.freePractice.turn1 = this._arrayReducer(freePractice1)
            results.freePractice.turn2 = this._arrayReducer(freePractice2)
            results.freePractice.turn3 = this._arrayReducer(freePractice3)

            return results
        })
        .catch((error) => {
            console.log(error);
        });
    }

    static _sliceIntoChunks = (arr, chunkSize, stratingIndex) => {
        const res = [];
        for (let i = stratingIndex; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize)
            res.push(chunk)
        }
        return res;
    }

    static _arrayReducer = (arr) => {
        let result = []
        let pilotInfo = {}
        const formattedArray = this._sliceIntoChunks(arr, 2, 0)
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

module.exports = Scraper

