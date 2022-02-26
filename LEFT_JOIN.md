쿼리 페이징에 LEFT OUTER JOIN

```postgresql
CREATE TABLE chat_message
(
    id          integer,
    room_id     integer,
    message     text,
    register_id varchar(100),
    create_at   timestamp,
    constraint chat_message_pk PRIMARY KEY (id)
);

CREATE TABLE user
(
    id        integer,
    name      integer,
    create_at timestamp,
    constraint chat_message_pk PRIMARY KEY (id)
);
```

```postgresql
SELECT cm.message_id,
       cm.room_id,
       cm.message,
       cm.create_at,
       cm.register_id,
       app_user.name AS register_name,
FROM (
         SELECT *
         FROM chat_message
         WHERE room_id = ?
         ORDER BY create_at DESC
         LIMIT 20
     ) cm
         LEFT OUTER JOIN app_user ON app_user.id = cm.register_id

SELECT cm.id         AS chat_message_id,
       cm.room_id,
       cm.message,
       cm.create_at,
       cm.register_id,
       app_user.name AS register_name
FROM chat_message cm
         LEFT OUTER JOIN app_user ON app_user.id = cm.register_id
WHERE room_id = 1
ORDER BY create_at DESC
LIMIT 20
```

