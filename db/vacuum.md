# vaccum test

- 기준 : postgresql 12.8

```sql
--TABLE CHECK
SELECT relname, n_live_tup, n_dead_tup, pg_total_relation_size('dummy_test') as size
FROM pg_stat_user_tables WHERE relname = 'dummy_test';

-- INIT TABLE
DROP TABLE dummy_test;
CREATE TABLE dummy_test AS
SELECT dummy as idx,'테스트' || dummy AS test_string1
FROM generate_series(1, 100000) AS dummy;
```

```sql
--통계를 갱신!
ANALYZE dummy_test;
--ANALYZE VERBOSE dummy_test;

--DEAD_TUP을 재사용가능토록 마킹! (용량 유지)
VACUUM dummy_test; 
--VACUUM VERBOSE dummy_test; 

--DEAD_TUP을 재사용가능토록 마킹! (용량 유지) 이후 통계를 갱신!
VACUUM ANALYZE dummy_test; 
--VACUUM VERBOSE ANALYZE dummy_test; 

--테이블 재생성! (용량 확보, 락)
VACUUM FULL dummy_test; 
--VACUUM FULL VERBOSE dummy_test; 

--테이블 재생성! (용량 확보, 락) 이후 통계를 갱신!
VACUUM FULL ANALYZE dummy_test; 
--VACUUM FULL VERBOSE ANALYZE dummy_test; 

--VERBOSE를 포함할 경우 실행 로그가 출력됩니다.
--AUTOVACUUM과 VACUUM의 역할을 비슷하다고 볼 수 있다.
```

### Update Case1. Update 혹은 Vacuum을 하면 SIZE가 늘어난다.

```sql
DROP TABLE dummy_test;
CREATE TABLE dummy_test AS
SELECT dummy as idx,'테스트' || dummy AS test_string1
FROM generate_series(1, 100000) AS dummy;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5226496

UPDATE dummy_test set test_string1 = 'data' WHERE idx <= 10000;

--RESULT : n_live_tup : 100000, n_dead_tup : 10000, size : 5693440

ANALYZE dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 10000, size : 5693440

VACUUM dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5701632

ANALYZE dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5701632

VACUUM FULL dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5152768
```

### Update Case2. Vacuum FULL 에는 ANALYZE 가 없다.

```sql
DROP TABLE dummy_test;
CREATE TABLE dummy_test AS
SELECT dummy as idx,'테스트' || dummy AS test_string1
FROM generate_series(1, 100000) AS dummy;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5226496

UPDATE dummy_test set test_string1 = 'data' WHERE idx <= 10000;

--RESULT : n_live_tup : 100000, n_dead_tup : 10000, size : 5693440

VACUUM FULL dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 10000, size : 5152768

ANALYZE dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5152768

// VACUUM FULL dummy_test; + ANALYZE dummy_test;
// => VACUUM FULL ANALYZE dummy_test;
```

### Update Case3. Vacuum FULL 에는 ANALYZE 가 없다.

```sql
DROP TABLE dummy_test;
CREATE TABLE dummy_test AS
SELECT dummy as idx,'테스트' || dummy AS test_string1
FROM generate_series(1, 100000) AS dummy;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5226496

VACUUM FULL ANALYZE dummy_test;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5226496
```

### Delete Case1. n_live_tup 이 실제 값과 달라질 수도 있다.

```sql
DROP TABLE dummy_test;
CREATE TABLE dummy_test AS
SELECT dummy as idx,'테스트' || dummy AS test_string1
FROM generate_series(1, 100000) AS dummy;

--RESULT : n_live_tup : 100000, n_dead_tup : 0, size : 5226496

DELETE FROM dummy_test WHERE idx <= 10000;

--RESULT : n_live_tup : 90000, n_dead_tup : 10000, size : 5226496

VACUUM dummy_test;

--RESULT1 : n_live_tup : 89992, n_dead_tup : 0, size : 5259264
--RESULT2 : n_live_tup : 90000, n_dead_tup : 0, size : 5259264

ANALYZE dummy_test;

--RESULT : n_live_tup : 90000, n_dead_tup : 0, size : 5259264

VACUUM FULL ANALYZE dummy_test;

--RESULT : n_live_tup : 90000, n_dead_tup : 0, size : 4710400
```

### Case Study를 통해 알게 된 사실 : analyze 를 포함시키는 것이 좋다.

- update 쿼리는 테이블 용량을 늘어나게 할 수 있다.
- vacuum 쿼리는 테이블 용량을 늘어나게 할 수 있다.
- vacuum 쿼리는 통계상 n_dead_tup를 초기화 할 수 있다.
- vacuum full 쿼리는 통계상 n_dead_tup를 초기화 할 수 없다. (analyze 가 필요하다)
- vacuum 쿼리는 통계상 n_live_tup 이 실제 값을 다르게 만들 수 있다. (analyze 가 필요하다)