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
    ssl: process.env.SSL
});

module.exports = {

    sql: {
        insertQuery: "insert  into covid_status_dashboard(covid_status_dashboard_db_id, state, case_count, recovered_count, death_count, update_date) values (nextval('covid_status_dashboard_db_id'), $1, $4, $2, $3, date(now()))",
        selectAllQuery: "select today.*, today.case_count-coalesce(lastday.case_count,0) as totaldelta, today.recovered_count-coalesce(lastday.recovered_count,0) as recovereddelta, today.death_count-coalesce(lastday.death_count,0) as deathdelta from ( select distinct c.state,c.case_count,c.recovered_count,c.death_count from covid_status_dashboard as c where c.update_date = (select distinct update_date from covid_status_dashboard order by update_date desc limit 1 offset 0) and c.case_count>0 ) as today left join ( select distinct c.state,c.case_count,c.recovered_count,c.death_count from covid_status_dashboard as c where c.update_date = (select distinct update_date from covid_status_dashboard order by update_date desc limit 1 offset 1)) as lastday on today.state=lastday.state order by today.case_count desc",
        ifExistQuery: "select count(1) as exists from covid_status_dashboard where update_date =  date(now()) and state = $1",
        updateQuery: "update covid_status_dashboard set case_count = $4,recovered_count = $2 , death_count = $3 where update_date =  date(now()) and state = $1 ",
        selectTimeSeries: `select  sub.state,array_to_json(array_agg(row( to_char(sub.update_date, 'Mon DD, YYYY'), sub.case_count,(sub.case_count-(sub.recovered_count+sub.death_count)),sub.recovered_count,sub.death_count)order by update_date))as data from ( select * from covid_status_dashboard  order by update_date, state) as sub  group by  sub.state`
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
