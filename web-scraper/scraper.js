const axios = require('axios')
const cheerio = require('cheerio');
const { data } = require('cheerio/lib/api/attributes');
let dataArray = []

axios.get('https://sport.sky.it/formula-1/risultati')
    .then((response) => {
        const $ = cheerio.load(response.data)
        const dataTable = $(".ftbl__top-drivers__body")
        const tableRow = dataTable.find('.ftbl__top-drivers__body-cell-span > a')
        tableRow.each((i, element) => {
            dataArray.push($(element).text())
        })
        const raceChunkSize = 40
        const allStaanding = sliceIntoChunks(dataArray, raceChunkSize, 0)
        const raceResults = allStaanding[0]
        const startingGrid = allStaanding[1]
        const dataQ3 = sliceIntoChunks(dataArray, 20, 80)
        const dataQ2 = sliceIntoChunks(dataArray, 30, 100)
        const dataQ1 = sliceIntoChunks(dataArray, 40, 130)
        const freePracticeData = sliceIntoChunks(dataArray, 40, 170)

        const Q3results = dataQ3[0]
        const Q2results = dataQ2[0]
        const Q1results = dataQ1[0]
        const freePractice3 = freePracticeData[0]
        const freePractice2 = freePracticeData[1]
        const freePractice1 = freePracticeData[2]


        const raceFinalResult = arrayReducer(raceResults)
        raceFinalResult.forEach((item) => console.log(item.place, ": ", item.pilot))
    })
    .catch((error) => {
        console.log(error);
    });


    function sliceIntoChunks(arr, chunkSize, stratingIndex) {
        const res = [];
        for (let i = stratingIndex; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize)
            res.push(chunk)
        }
        return res;
    }

    function arrayReducer (arr) {
        let result = []
        let pilotInfo = {}
        const formattedArray = sliceIntoChunks(arr, 2, 0)
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
    