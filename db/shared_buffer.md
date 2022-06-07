### postgresql
### shared_buffers (공유버퍼)

[v] 목적
DISK IO 를 최소화함으로써 IO 성능을 향상
1) 매우 큰 (수십, 수백 GB) 버퍼를 빠르게 액세스해야 한다.
2) 많은 사용자가 동시에 접근할 때 경합을 최소화해야 한다.
3) 자주 사용되는 블록은 최대한 오랫동안 버퍼 내에 있어야 한다.

출처 : https://vdocuments.mx/postgresql-96-.html - 45page

[v] 적절한 할당량
공식문서 https://www.postgresql.org/docs/11/runtime-config-resource.html 에 의하면
PostgreSQL 서버의 권장 shared_buffers 값은 시스템 메모리의 25%입니다.
PostgreSQL 서버는 운영 체제 캐시에 의존합니다.
그래서 RAM의 40% 이상 할당하지 않는 것이 좋습니다.

[v] 토픽. Aurora PostgreSQL의 shared_buffers DB 파라미터 기본값이
Amazon RDS PostgreSQL의 기본값보다 높은 이유는 무엇입니까?

PostgreSQL 서버의 권장 shared_buffers 값은 시스템 메모리의 25%입니다.
PostgreSQL 서버는 운영 체제 캐시에 의존합니다.
그래서 RAM의 40% 이상 할당하지 않는 것이 좋습니다.
그래서 RDS DB 인스턴스의 shared_buffers 기본 값은 25%로 설정됩니다.
하지만 Aurora DB 인스턴스의 shared_buffers 기본 값은 75%로 설정됩니다.
이는 Aurora가 파일 시스템 캐시를 활용하지 않기 때문입니다.
Aurora의 shared_buffers 기본 값은 75%보다 더 작을 경우 성능이 저하될수 있습니다.

출처 : https://aws.amazon.com/ko/premiumsupport/knowledge-center/rds-aurora-postgresql-shared-buffers/

128GB Aurora DB => 11035447 : 8kB = 88283576 : 1kB => {(88283576 / 134217728) * 100} => 66%
016GB Aurora DB => 10544928 : 1kB => {(10544928 / 16777216) * 100} => 62%

### work_mem