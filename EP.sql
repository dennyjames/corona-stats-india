insert  into covid_status_dashboard(covid_status_dashboard_db_id, state, case_count, recovered_count, death_count, update_date) 
 
(select nextval('covid_status_dashboard_db_id') covid_status_dashboard_db_id, 'All Inida' as state, sum(case_count) case_count, sum(recovered_count) recovered_count ,sum (death_count) death_count
,update_date from covid_status_dashboard 
where state <> 'All India'
and update_date in
(
select distinct(update_date) from covid_status_dashboard
where
1=1
and update_date not in 
(select distinct(update_date) from covid_status_dashboard where state='All India')
)
group by  update_date
)
