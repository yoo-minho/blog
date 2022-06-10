bloat 현상

### ****How does it happen****

MVCC(다중버전동시성제어) 방식에서 bloat는 당연한 현상입니다.
UPDATE 또는 DELETE 문이

### index bloat

- 쿼리

  참고 : [https://github.com/pgexperts/pgx_scripts/blob/master/bloat/index_bloat_check.sql](https://github.com/pgexperts/pgx_scripts/blob/master/bloat/index_bloat_check.sql)

    ```sql
    WITH btree_index_atts AS (
        SELECT nspname, 
            indexclass.relname as index_name, 
            indexclass.reltuples, 
            indexclass.relpages, 
            indrelid, indexrelid,
            indexclass.relam,
            tableclass.relname as tablename,
            regexp_split_to_table(indkey::text, ' ')::smallint AS attnum,
            indexrelid as index_oid
        FROM pg_index
        JOIN pg_class AS indexclass ON pg_index.indexrelid = indexclass.oid
        JOIN pg_class AS tableclass ON pg_index.indrelid = tableclass.oid
        JOIN pg_namespace ON pg_namespace.oid = indexclass.relnamespace
        JOIN pg_am ON indexclass.relam = pg_am.oid
        WHERE pg_am.amname = 'btree' and indexclass.relpages > 0
             AND nspname NOT IN ('pg_catalog','information_schema')
        ),
    index_item_sizes AS (
        SELECT
        ind_atts.nspname, ind_atts.index_name, 
        ind_atts.reltuples, ind_atts.relpages, ind_atts.relam,
        indrelid AS table_oid, index_oid,
        current_setting('block_size')::numeric AS bs,
        8 AS maxalign,
        24 AS pagehdr,
        CASE WHEN max(coalesce(pg_stats.null_frac,0)) = 0
            THEN 2
            ELSE 6
        END AS index_tuple_hdr,
        sum( (1-coalesce(pg_stats.null_frac, 0)) * coalesce(pg_stats.avg_width, 1024) ) AS nulldatawidth
        FROM pg_attribute
        JOIN btree_index_atts AS ind_atts ON pg_attribute.attrelid = ind_atts.indexrelid AND pg_attribute.attnum = ind_atts.attnum
        JOIN pg_stats ON pg_stats.schemaname = ind_atts.nspname
              AND ( (pg_stats.tablename = ind_atts.tablename AND pg_stats.attname = pg_catalog.pg_get_indexdef(pg_attribute.attrelid, pg_attribute.attnum, TRUE)) 
              OR   (pg_stats.tablename = ind_atts.index_name AND pg_stats.attname = pg_attribute.attname))
        WHERE pg_attribute.attnum > 0
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9
    ),
    index_aligned_est AS (
        SELECT maxalign, bs, nspname, index_name, reltuples,
            relpages, relam, table_oid, index_oid,
            coalesce (
                ceil (
                    reltuples * ( 6 
                        + maxalign 
                        - CASE
                            WHEN index_tuple_hdr%maxalign = 0 THEN maxalign
                            ELSE index_tuple_hdr%maxalign
                          END
                        + nulldatawidth 
                        + maxalign 
                        - CASE /* Add padding to the data to align on MAXALIGN */
                            WHEN nulldatawidth::integer%maxalign = 0 THEN maxalign
                            ELSE nulldatawidth::integer%maxalign
                          END
                    )::numeric 
                  / ( bs - pagehdr::NUMERIC )
                  +1 )
             , 0 )
          as expected
        FROM index_item_sizes
    ),
    raw_bloat AS (
        SELECT current_database() as dbname, nspname, pg_class.relname AS table_name, index_name,
            bs*(index_aligned_est.relpages)::bigint AS totalbytes, expected,
            CASE WHEN index_aligned_est.relpages <= expected THEN 0 ELSE bs*(index_aligned_est.relpages-expected)::bigint END AS wastedbytes,
            CASE WHEN index_aligned_est.relpages <= expected THEN 0 ELSE bs*(index_aligned_est.relpages-expected)::bigint * 100 / (bs*(index_aligned_est.relpages)::bigint) END AS realbloat,
            pg_relation_size(index_aligned_est.table_oid) as table_bytes,
            stat.idx_scan as index_scans
        FROM index_aligned_est
        JOIN pg_class ON pg_class.oid=index_aligned_est.table_oid
        JOIN pg_stat_user_indexes AS stat ON index_aligned_est.index_oid = stat.indexrelid
    ),
    format_bloat AS (
    		SELECT dbname as database_name, nspname as schema_name, table_name, index_name,
    		        round(realbloat) as bloat_pct,
    					round(wastedbytes/(1024^2)::NUMERIC) as bloat_mb,
    		        round(totalbytes/(1024^2)::NUMERIC,3) as index_mb,
    		        round(table_bytes/(1024^2)::NUMERIC,3) as table_mb,
    		        index_scans
    		FROM raw_bloat
    )
    SELECT 
       database_name, schema_name, table_name, index_name,
       bloat_pct as "낭비(bloat) 퍼센트(%)", 
       bloat_mb as "낭비(bloat) 용량(mb)",
       index_mb as "테이블 용량 (mb)",
       index_scans as "인덱스스캔수",
       (select SUBSTR(indexdef, POSITION('(' in indexdef)) from pg_indexes where indexname = format_bloat.index_name) as "인덱스정보"
    FROM format_bloat
    WHERE ( bloat_pct > 50 and bloat_mb > 10 )
    ORDER BY table_name, bloat_pct DESC;
    ```

- 도출 내용
    - bloat 된 인덱스가 굉장히 많다.
    - 미사용 인덱스도 많다.

### table bloat

- 쿼리

  [https://github.com/pgexperts/pgx_scripts/blob/master/bloat/table_bloat_check.sql](https://github.com/pgexperts/pgx_scripts/blob/master/bloat/table_bloat_check.sql)

    ```sql
    WITH constants AS (
        SELECT current_setting('block_size')::numeric AS bs, 23 AS hdr, 8 AS ma
    ),
    no_stats AS (
        SELECT table_schema, table_name, 
            n_live_tup::numeric as est_rows,
            pg_table_size(relid)::numeric as table_size
        FROM information_schema.columns
            JOIN pg_stat_user_tables as psut
               ON table_schema = psut.schemaname
               AND table_name = psut.relname
            LEFT OUTER JOIN pg_stats
            ON table_schema = pg_stats.schemaname
                AND table_name = pg_stats.tablename
                AND column_name = attname 
        WHERE attname IS NULL
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
        GROUP BY table_schema, table_name, relid, n_live_tup
    ),
    null_headers AS (
        SELECT
            hdr+1+(sum(case when null_frac <> 0 THEN 1 else 0 END)/8) as nullhdr,
            SUM((1-null_frac)*avg_width) as datawidth,
            MAX(null_frac) as maxfracsum,
            schemaname,
            tablename,
            hdr, ma, bs
        FROM pg_stats CROSS JOIN constants
            LEFT OUTER JOIN no_stats
                ON schemaname = no_stats.table_schema
                AND tablename = no_stats.table_name
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            AND no_stats.table_name IS NULL
            AND EXISTS ( SELECT 1
                FROM information_schema.columns
                    WHERE schemaname = columns.table_schema
                        AND tablename = columns.table_name )
        GROUP BY schemaname, tablename, hdr, ma, bs
    ),
    data_headers AS (
        SELECT
            ma, bs, hdr, schemaname, tablename,
            (datawidth+(hdr+ma-(case when hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
            (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
        FROM null_headers
    ),
    table_estimates AS (
        SELECT schemaname, tablename, bs,
            reltuples::numeric as est_rows, relpages * bs as table_bytes,
        CEIL((reltuples*
                (datahdr + nullhdr2 + 4 + ma -
                    (CASE WHEN datahdr%ma=0
                        THEN ma ELSE datahdr%ma END)
                    )/(bs-20))) * bs AS expected_bytes,
            reltoastrelid
        FROM data_headers
            JOIN pg_class ON tablename = relname
            JOIN pg_namespace ON relnamespace = pg_namespace.oid
                AND schemaname = nspname
        WHERE pg_class.relkind = 'r'
    ),
    estimates_with_toast AS (
        SELECT schemaname, tablename, 
            TRUE as can_estimate,
            est_rows,
            table_bytes + ( coalesce(toast.relpages, 0) * bs ) as table_bytes,
            expected_bytes + ( ceil( coalesce(toast.reltuples, 0) / 4 ) * bs ) as expected_bytes
        FROM table_estimates LEFT OUTER JOIN pg_class as toast
            ON table_estimates.reltoastrelid = toast.oid
                AND toast.relkind = 't'
    ),
    table_estimates_plus AS (
        SELECT current_database() as databasename,
                schemaname, tablename, can_estimate, 
                est_rows,
                CASE WHEN table_bytes > 0
                    THEN table_bytes::NUMERIC
                    ELSE NULL::NUMERIC END
                    AS table_bytes,
                CASE WHEN expected_bytes > 0 
                    THEN expected_bytes::NUMERIC
                    ELSE NULL::NUMERIC END
                        AS expected_bytes,
                CASE WHEN expected_bytes > 0 AND table_bytes > 0
                    AND expected_bytes <= table_bytes
                    THEN (table_bytes - expected_bytes)::NUMERIC
                    ELSE 0::NUMERIC END AS bloat_bytes
        FROM estimates_with_toast
        UNION ALL
        SELECT current_database() as databasename, 
            table_schema, table_name, FALSE, 
            est_rows, table_size,
            NULL::NUMERIC, NULL::NUMERIC
        FROM no_stats
    ),
    bloat_data AS (
        select current_database() as databasename,
            schemaname, tablename, can_estimate, 
            table_bytes, round(table_bytes/(1024^2)::NUMERIC,3) as table_mb,
            expected_bytes, round(expected_bytes/(1024^2)::NUMERIC,3) as expected_mb,
            round(bloat_bytes*100/table_bytes) as pct_bloat,
            round(bloat_bytes/(1024::NUMERIC^2),2) as mb_bloat,
            table_bytes, expected_bytes, est_rows
        FROM table_estimates_plus
    )
    SELECT databasename, schemaname, tablename,
        can_estimate,
        est_rows as "추정 전체 열 데이터 (건)",
        pct_bloat as "낭비(bloat) 퍼센트(%)", 
    	mb_bloat as "낭비(bloat) 용량(mb)",
        table_mb as "테이블 용량 (mb)"
    FROM bloat_data
    WHERE pct_bloat >= 25 AND mb_bloat >= 10 
    ORDER BY mb_bloat DESC;
    ```

- 도출 내용
    - 생각보다 bloat 된 테이블을 많지 않다.

### ****How to remove bloat?****

1. autovacuum 활성화
2. vacuum full (테이블 ,인덱스 잠금이라 비권장)
3. reindex (쓰기만 잠금)
4. pg_repack (읽기, 쓰기 잠금이 없으나 vacuum full 보다 훨씬 빠름)

출처 : [https://www.highgo.ca/2021/03/20/how-to-check-and-resolve-bloat-in-postgresql/](https://www.highgo.ca/2021/03/20/how-to-check-and-resolve-bloat-in-postgresql/)