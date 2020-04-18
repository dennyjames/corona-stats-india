const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const db = require('./db');
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get("/all/", async function (req, res) {

    const result = await db.query(db.sql.selectAllQuery);
    res.send(result.rows)
});

app.get("/timeseries/", async function (req, res) {

    const timeSeries = await db.query(db.sql.selectTimeSeries);
    res.send(timeSeries.rows);
});

app.listen(port, function () {
    console.log("Your app is listening");
});




setInterval(async () => {
    console.log("Refresh job started")
    let response;
    try {
        response = await axios.get("https://www.mohfw.gov.in/");
        if (response.status !== 200) {
            console.log("ERROR");
        }
    } catch (err) {
        return null;
    }


    // get HTML and parse death rates
    const html = cheerio.load(response.data);

    const table = html("#state-data > div > div > div > div > table > tbody").children("tr").toArray()

    for (let row of table) {
        let result = [];
        const cells = row.children.filter(i => i.type === "tag");
        if (cells.length === 4) {

            for (let j = 0; j < cells.length; j++) {

                const customCell = cells[j].children.filter(i => i.type === "tag")[0];
                //state name
                if (j === 0) {
                    result.push('All India');
                }
                // total_case
                if (j === 1) {
                    result.push(parseInt(customCell.children[0].data));
                }
                // recovered
                if (j === 2) {
                    result.push(parseInt(customCell.children[0].data));
                }
                //death
                if (j === 3) {
                    result.push(parseInt(customCell.children[0].data));
                }
            }
        }
        if (cells.length === 5) {
            for (let j = 1; j < cells.length; j++) {
                //state name
                if (j === 1) {
                    result.push(cells[j].children[0].data);
                }
                // total_case
                if (j === 2) {
                    result.push(parseInt(cells[j].children[0].data));
                }
                // recovered
                if (j === 3) {
                    result.push(parseInt(cells[j].children[0].data));
                }
                //death
                if (j === 4) {
                    result.push(parseInt(cells[j].children[0].data));
                }

            }
        }
        if(result.length ===4) {
            try {
                let rowCount = await db.query(db.sql.ifExistQuery, [result[0]]);
                if (rowCount.rows[0] !== undefined && parseInt(rowCount.rows[0].exists) > 0)

                    await db.query(db.sql.updateQuery, result);
                else

                    await db.query(db.sql.insertQuery, result);

            } catch (err) {
                console.log(err.stack)
            }

        }

    }
    console.log("Refresh job finished")
}, 2000);


