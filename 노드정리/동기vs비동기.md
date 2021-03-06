프로그래밍에 가장 기본이 되는 동기(synchronous)와 비동기(Asynchronous)를 쉽게 설명해보려고 한다.

### 왜 동기라는 용어는 혼란스러운가?

'synchronous' is existing or occurring at the same time. - Google Dictionary

동기(synchronous)는 영단어 직역을 하면 '동시에 발생하는 방식'이라고 한다.
이게 혹시 함수가 동시에 실행된다는 건가? 그럼 비동기 개념 아닌가? 하며 혼란에 빠질 수 있다.

하지만 조금씩 비슷한 의미를 따라가다보면 충분히 이해할 수도 있어보인다.

여기서 
'동시에 발생하는 방식'으로 딱 한번 실행하는 상황을 가정하는 것보단,
'동시에 발생하는 방식'이 연속적으로 실행하는 상황을 가정하면 전개가 좀 용이하다.

'동시에 발생하는 방식들의 연속' => 
'어떤 발생들의 시간이 같은 상황' => 
'시간에 맞춰 발생하는 상황' => 
'순차로 발생하는 상황' 

8명이 하는 팀 싱크로나이즈드 수영을 상상해보자.
시작하고 0~1초는 A동작, 1~3초는 B동작, 3~6초는 C동작의 모습을 상상할 수 있다.

'동시에 발생하는 방식들의 연속'은 맞고,
'순차로 발생하는 상황'도 맞다.

동기이 반대 개념으로 비동기를 해석하면,
'순차로 발생하지 않는 상황' =>
'자유롭게 발생하는 상황'

이 개념 그대로
비동기 싱크로나이즈드 수영을 상상해보자.
시작하고 1명이 A동작(1초), 2명이 B동작(2초), 4명이 C동작(3초)을 팀원들 각자 자유롭게 실행하는 모습을 상상할 수 있다.
모든 동작이 시작시간이 같을 수도 있고, 
모든 동작이 끝시간이 같을 수도 있고,
A, B 동작은 동시에 시작하고, C는 나중에 시작할 수도 있다.
말 그대로 자유롭게 발생할 수 있다.

여기서, '동시에' 키워드가 있으니 동기 아님? 물을 수 있는데,
(여러 사람이 동시에) 동시에 8명의 팀원이 A동작, B동작, C동작 순차적으로 동작한 것을 동기식 동작으로 보면,
(여러 동작이 동시에) 동시에 1명의 팀원이 A동작, 2명의 팀원이 B동작, 4명의 팀원이 C동작한 것을 비동기 동작으로 볼 수 있다는 거다. 

그래서,
동기식 코드는 '순차로 발생하는 코드의 흐름'
비동기식 코드는 '자유롭게 발생하는 코드의 흐름' 
이라고 이해할 수 있다.

(동기는 synchronous, 순차는 sequential 분명 다른 의미지만 관점에 따라 충분히 이해가능해보인다.
어렵다면 프로그래밍하면서는 동기는 순차로 보는것이 정신건강에 좋다)

### 왜 비동기가 필요할까?

위에서 싱크로나이즈드 수영을 설명하면서, 비동기 싱크로나이즈드 수영 같은게 필요할까 라는 생각이 들었다.
이 생각은 비동기 또한 필요한가? 라는 생각이 들게 한다.

싱크로나이즈드 수영의 목적이 '팀원들의 통일미(美)'이 아니라 
'3개 동작 가장 빠르게 구현하기'으로 바뀌었다고 해보자.
(이름도 '스피드 액션 수영'이라고 바꿔보자.)

첫번째 팀은 시작하고 8명 모두 0 ~ 2초는 A 동작, 2 ~ 4초는 B 동작, 4 ~ 6 초는 C 동작 했다면 6초가 걸리게 구성했다.
두번째 팀은 시작하고 1명은 A동작(1초), 2명은 B동작(2초), 4명은 C동작(3초)을 같은 시간에 시작해 3초가 걸리게 구성했다.

이 스포츠의 승리는 두번째 팀에게 갈 것이다.

프로그래밍은 예술보다는 속도와 성능을 따지는 계산적인 분야기 때문에 비동기 개념이 필요하다.

### 왜 그럼 다 비동기를 안할까?

새로운 상황을 가정해보자.
핫도그 3개 정도는 충분히 들어가 보이는 튀김기가 있다. (한정된 환경)

핫도그 10개 주문이 한꺼번에 들어왔고 10개 모두 튀김기에 때려 넣었다.
핫도그 밀가루 반죽 더블더블추가 요청으로 1개의 핫도그가 4배로 커졌는데 그냥 튀김기에 때려 넣었다.

한정된 튀김기로는 모든 핫도그 주문 조건이 같지 않기에 무조건 때려넣을 수 없다.
=> 한정된 환경으로는 모든 작업 조건이 같지 않기에 무조건 비동기로 처리할 순 없다.
=> 한정된 환경으로는 모든 작업 조건이 같지 않기에 상황에 맞춰 동기식/비동기식 코드를 작성한다.

### 동기와 비동기의 관계는?

핫도그 10개 주문이 한꺼번에 들어왔다고 10개 모두 튀김기에 때려 넣지말고,
순차적으로
1번째 튀기고 (핫도그 3개),
2번째 튀기고 (핫도그 3개),
3번째 튀기고 (핫도그 3개),
4번째 튀긴다 (핫도그 1개).

순차로 발생하는 튀기기 흐름이기에 위 과정은 동기식 튀김이다.
하지만 1번째 튀김 과정을 들여다보면 
3개가 순차로 발생하는 튀기기 흐름으로 할 수도 있었는데
자유롭게 (같은 시작시간에) 발생하는 튀기기 흐름이기에
비동기식 튀김이라 볼 수 있다.

오히려 동기와 비동기는 정확히 반대 관계라기 보다는
항상 공존하는 관계랄까.

(현업에서는 이러한 케이스가 많다)

### 공존하기 위해서 수시로 변환 가능!

상황에 맞게 공존하기 위해서는 변환이 가능해야한다.
기본적으로 동기식 코드를 비동기식으로 만드는 스킬이 필요하고,
(자바스크립트에서는 Promise.all, 자바에서는 쓰레드)
비동기식인 코드를 동기식으로 만드는 스킬 또한 필요하다.
(자바스크립트에서는 await/async, 자바에서는 Syncronized Method)

### 그래서?

상황에 맞춰
동기와 비동기를 적절하게 버무려 
성능 좋은 결과물을 만들어 내면 된다.

-https://evan-moon.github.io/2019/09/19/sync-async-blocking-non-blocking/