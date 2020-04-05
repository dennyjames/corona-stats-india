const {Pool} = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 5,
    ssl: true
});

module.exports = {

    sql: {
        insertQuery: "insert  into covid_status_dashboard(covid_status_dashboard_db_id, state, case_count, recovered_count, death_count, update_date) values (nextval('covid_status_dashboard_db_id'), $1, $2, $3, $4, date(now()))",
        selectAllQuery: "select 'total' as state, (case_count) as case_count, (recovered_count) as recovered_count ,(death_count) as death_count from covid_status_dashboard where update_date = (select distinct update_date from covid_status_dashboard order by 1 desc limit 1) and state = 'All India' order by 2 desc",
        selectStateQuery: "select state,case_count,recovered_count,death_count from covid_status_dashboard where update_date = (select distinct update_date from covid_status_dashboard order by 1 desc limit 1) and state <> 'All India' order by 2 desc",
        ifExistQuery: "select count(1) as exists from covid_status_dashboard where update_date =  date(now()) and state = $1",
        updateQuery: "update covid_status_dashboard set case_count = $2,recovered_count = $3 , death_count = $4 where update_date =  date(now()) and state = $1 ",
        selectTimeSeries: `select  sub.state,array_to_json(array_agg(row( to_char(sub.update_date, 'Mon DD, YYYY'), sub.case_count)order by update_date))as data from (
                            select distinct(c.update_date),s.state,COALESCE(dataset.case_count,0) as case_count from covid_status_dashboard c
                            cross join 
                            (select distinct state from covid_status_dashboard) s
                            left join
                            (select * from covid_status_dashboard) dataset
                            on dataset.state=s.state and dataset.update_date = c.update_date
                            order by update_date, state) as sub  group by  sub.state`
    },
    query: async (text, params) => {
        const client = await pool.connect()
        try {
            var result = await client.query(text, params);
        } catch (err) {
            console.log(err.stack)
        } finally {
            client.release();
        }
        return result;
    }
};
