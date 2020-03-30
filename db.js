const {Pool} = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 5
    //ssl: true
});

module.exports = {

    sql: {
        deleteQuery: "delete  from covid_status_dashboard where update_date =  date(now())",
        insertQuery: "insert  into covid_status_dashboard(covid_status_dashboard_db_id, state, case_count, recovered_count, death_count, update_date) values (nextval('covid_status_dashboard_db_id'), $1, $2, $3, $4, date(now()))",
        selectAllQuery: "select 'total' as state, sum(case_count) as case_count, sum(recovered_count) as recovered_count ,sum(death_count) as death_count from covid_status_dashboard where update_date = (select distinct update_date from covid_status_dashboard order by 1 desc limit 1) order by 2 desc",
        selectStateQuery: "select state,case_count,recovered_count,death_count from covid_status_dashboard where update_date = (select distinct update_date from covid_status_dashboard order by 1 desc limit 1) order by 2 desc",
        ifExistQuery: "select count(1) as exists from covid_status_dashboard where update_date =  date(now()) and state = $1",
        updateQuery: "update covid_status_dashboard set case_count = $2,recovered_count = $3 , death_count = $4 where update_date =  date(now()) and state = $1 "


    },
    query: async (text, params) => {
        const client = await pool.connect()
        try {
            var result = await client.query(text, params);
        } finally {
            client.release();
        }
        return result;
    }
};
