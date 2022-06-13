### postgresql
### vacuum

[v] 1. MVCC => DEAD_TUPLE => BLOAT
postgreSQL은 MVCC(다중버전 동시성 제어)의 이점을 위해 'UPDATE'와 'DELETE' 수행 후 이전 데이터를 즉시 제거하지 않는다.
즉시 제거하지 않은 이전 데이터를 'Dead Tuple'이라고 말한다.
그로 인해, Table Bloat(테이블 팽창), Index Bloat(인덱스 팽창) 발생할 수 있다.
이는 불필요한 I/O의 증가와 부적절한 인덱싱을 초래한다. 

1-1. 어떻게 확인하는가?
* 팽창(BLOAT) 확인 : Star 1.1k의 Githup 오픈소스 (https://github.com/pgexperts/pgx_scripts/tree/master/bloat)
* 튜플 확인 
```sql
SELECT relname, n_dead_tup, n_live_tup, (n_dead_tup / n_live_tup) AS ratio, last_vacuum, last_autovacuum 
FROM pg_catalog.pg_stat_all_tables 
WHERE relname = 'sample_table'
```

1-2. UPDATE를 여러번 해도 Dead Tuple + 1이 계속 되는가?
그렇다. 
만약 1회 UPDATE 후 vacuum을 진행하면, 재사용 가능하도록 마킹이 되고,
그 후 또 UPDATE를 실행하면 그땐 +1이 되지 않는다. 
1 UPDATE - 1 VACUUM 시에만 DEAD_TUPLE이 1개 유지된다.

1-3. UPDATE를 동일한 값으로 여러번 해도 Dead Tuple + 1이 계속 되는가?
그렇다.
=> 그래서, 동일 값일땐, IS DISTINCT FROM 구문을 활용하면 Dead Tuple 방지가 가능하다.

```sql
UPDATE sample_table set column1 = 'test' WHERE idx = 1 and column1 IS DISTINCT FROM 'test';
```

1-4. UPDATE를 했을때 테이블 용량이 증가하는가? 
당연하다. 이전 데이터와 이후 데이터 모두 보관하고 있기에 그만큼 용량이 증가한다.

[v] 2. Vacuum VS Full Vacuum
Vacuum은 'Dead Tuple'를 정리하는 과정과 그로 인해 파생되는 다양한 이슈를 처리하는 프로세스를 칭한다.
프로세스 종류는 일반 Vacuum과 Full Vacuum가 있다.

- Vacuum
    - Dead Tuple 이 재사용 가능하다고 마킹만 해둔다. 
    - 테이블 용량은 확보하지 못하고, 재사용 공간만 확보한다.
    - 통계(pg_stat_user_tables) 상으론 Dead_tuple이 처리된다. 
    - 약간의 테이블 select 딜레이가 생긴다 (전혀 영향도가 없다고 설명하는 글들도 있지만, 경험상 대용량 테이블의 경우 딜레이가 생긴다.)
- Full Vacuum
    - Live Tuple 만 copy 하여 새 테이블을 만들고, 본 테이블을 제거되면 역할을 대신한다. 
    - 테이블 용량이 확보된다.
    - 리인덱싱된다. 
    - exclusive Lock이 걸린다. (테이블 관련 모든 쿼리가 먹통이 된다.)
    
[v] 3. 명령어

- VERBOSE는 단지 로그를 표현할 뿐이다.
- VACUUM(정리)과 ANANLYZE(통계 정보 갱신)는 독립적인 프로세스이고 한 구문에 같이 쓸 수 있다.
- VACUUM와 ANALYZE를 함께 쓰는 경우 VERBOSE는 중간에 1번 적어주면 된다.

```sql
--통계를 갱신!
ANALYZE sample_table;
--ANALYZE VERBOSE sample_table;

--DEAD_TUP을 재사용가능토록 마킹! (용량 유지)
VACUUM sample_table; 
--VACUUM VERBOSE sample_table; 

--DEAD_TUP을 재사용가능토록 마킹! (용량 유지) 이후 통계를 갱신!
VACUUM ANALYZE sample_table; 
--VACUUM VERBOSE ANALYZE sample_table; 

--테이블 재생성! (용량 확보, 락)
VACUUM FULL sample_table; 
--VACUUM FULL VERBOSE sample_table; 

--테이블 재생성! (용량 확보, 락) 이후 통계를 갱신!
VACUUM FULL ANALYZE sample_table; 
--VACUUM FULL VERBOSE ANALYZE sample_table; 
```

[v] 4. autovaccum

Vacuum을 자동으로 처리해주는 것이 autovaccum이다. 
autovacuum이 실행되고 있을때 pg_stat_activity(쿼리 프로세스)를 확인하면 아래와 같이 표기된다.
```sql
autovacuum: VACUUM ANALYZE sample_table;
```
그러므로, autovacuum은 FULL VACUUM이 아닌 VACUUM으로 해석하면 된다. 
테이블 볼륨이 기하급수적으로 커지면서 'UPDATE'와 'DELETE'가 잦은 테이블이라면,
autovacuum(VACUUM)으로는 한계가 있기 때문에 적극적인 개입을 통한 FULL VACUUM이 필요하다.

4-1. autovacuum의 기준

- autovacuum_vacuum_scale_factor : dead_tuple / live_tuple 의 비율이 지정한 값을 넘으면 수행된다. (ex. 0.1)
- autovacuum_vacuum_threadhold : dead_tuple 의 개수가 지정한 값을 넘으면 수행된다. (ex. 50)

4-2. 설정값을 테이블마다 다르게 적용할 수 있는가?
가능하다.
- ALTER TABlE sample_table SET (autovacuum_vacuum_threshold = 50);
- ALTER TABlE sample_table SET (autovaccum_enabled = false);
- ALTER TABlE sample_table SET (autovacuum_vacuum_sacle_factor = 0.1);

5. 핵심
Vacuum의 핵심은 
그 테이블이 얼마나 부풀려졌냐가 아니라, 
그 부풀림(Bloat)이 일정 수준까지 일어나고 멈추느냐이다. 
이 부풀림(Bloat)의 비율이 계속 커진다면, 관리자의 적극적인 개입이 필요하다. 

출처 1 : https://hochoon-dev.tistory.com/entry/Postgresql-Vacuum?category=1090603
출처 2 : https://www.postgresql.org/docs/current/routine-vacuuming.html
출처 3 : https://postgresql.kr/blog/postgresql_table_bloating.html
출처 4 : https://dba.stackexchange.com/questions/118178/does-updating-a-row-with-the-same-value-actually-update-the-row
