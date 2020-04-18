
CREATE SEQUENCE covid_status_dashboard_db_id
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 34148
  CACHE 1;
ALTER TABLE covid_status_dashboard_db_id
  OWNER TO postgres;


CREATE TABLE covid_status_dashboard
(
  covid_status_dashboard_db_id bigint NOT NULL,
  state text,
  case_count bigint,
  recovered_count bigint,
  death_count bigint,
  update_date date,
  CONSTRAINT covid_status_dashboard_pkey PRIMARY KEY (covid_status_dashboard_db_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE covid_status_dashboard
  OWNER TO postgres;