# blog

simplify_if.js = 효율적인 if 에 대한 고민

제목 : 좋은 if 문 작성하기

왜 좋은 조건문(IF) 을 작성해야할까?

조건문은 모든 프로그래밍 언어를 막론하고 절대 빼놓을 수 없는 간단하지만 매우 중요한 뼈.대.요소라고 생각한다. 단순히 A의 경우에는 B의 로직이 수행되고, A가 아닌 경우에는 C의 로직이 수행된다는 개념을 떠나
새로운 경우가 계속 계속 생겨나면 그 경우의 수 자체가 서비스의 복잡도를 결정한다고 생각한다.

```js
if (A) {
    B();
} else {
    C();
}
```

좋은 조건문은 이러한 요소를 좋게 만든다는 것을 말한다.

그렇다면 좋은 조건문은 어떤 조건문을 말할까? 결국엔, 유지보수를 목적으로 하는 가.독.성 높은 조건문을 말한다. 여기서 단순히 가독성 높음에 집중하면 보기에만 좋은 떡?이 될 가능성이 높다. 유지보수를 목적으로
하는 가독성 높은 조건문을 작성한다면, 맛도 좋고 보기에도 좋은 떡이 될 수 있다.

'유지보수를 목적으로 하는 가독성 높음' 이라는 말 자체는 어렵지만, 결국 서비스를 함께 만드는 개발 팀원끼리 서로의 조건 로직을 잘 이해해서 잘 디벨롭하는 것이라고 생각한다.

왜 좋은 조건문(IF) 을 작성해야할까? 의 결론은 개발 팀원끼리 서로의 조건 로직을 잘 이해해 잘 디벨롭하기 위해서이다.

여기서 제시하는 몇가지 방법들은 대부분 사람들이 이해하기 쉽고 잘 디벨롭시킬 수 있는 방법이라 제시해본다.

혼자 좋다고 주장하는 방법은 독이 될 수 있으니 이 글을 통해 여러가지 방법을 만나보고, 좋은 조건문을 만들기 위해 개발 팀원들과 충분히 고민해보는 계기가 되면 좋겠다.

=======================================

방법1. EARLY RETURN, EARLY EXIT

그 말대로 일찍이 RETURN 하고, 함수를 빠져나오는 것이다. 바로 코드를 보자.

```js
//bad
//4자 이상인 id에서만 게시물 데이터를 추출한다.
function getBoardByRegisterId(registerId) {
    if (registerId.length >= 4) {
        if (registerId.test(/[0-9]/ig)) {
            const data = [];
            /**
             * 블라블라블라
             * 20 Line ...
             * 블라블라블라
             */
            return data;
        } else {
            alert('아이디는 숫자만 유효합니다.');
        }
    } else {
        alert('아이디는 4자 이상 필요합니다.');
    }
}

//good
function getBoardByRegisterId(registerId) {
    if (registerId.length < 4) return alert('아이디는 4자 이상 필요합니다.');
    if (registerId.length < 4) {
        alert('아이디는 4자 이상 필요합니다.');
        return;
    }
    const data = [];
    /**
     * 블라블라블라
     * 20 Line ...
     * 블라블라블라
     */
    return data;
}

```

좀 더 복잡한 코드를 보자.

```js
//bad
/**
 *
 * @param paymentType {string} 결제유형 - PAID, FREE
 * @param number {number} 나이
 * @param country {string} 국가 - korean, non-korean
 * @returns {string}
 */
function executeUserLogic(paymentType, age, country) {
    let logicName = "";
    if (paymentType === "PAID") {
        if (age > 20) {
            if (country === "korean") {
                logic1();
            } else {
                logic2();
            }
        } else {
            logic3();
        }
    } else {
        //pass
    }
}
```

조건문을 막연히 쓰다보면 위의 코드처럼 조건문(if) 마다 들여쓰기도 좌우로 늘어나고, 라인 수도 상하로 늘어나게 된다.

상하좌우 모두 늘어나게 되면 한 눈에 읽어야하는 코드가 좀 더 많아지기에 당연히 가독성은 떨어진다.

위의 코드는 로직들을 모두 logicN 이라는 함수로 추출해놓았기에 나름 간결해보이지만 실제 코드의 경우에는 모든 로직들을 함수로 빼놓지는 않기 때문에 훨씬 가독성을 해친다.

(가독성은 좀 더 낮지만 유지보수 목적 상 <Early Return>을 하지 말아야하는 경우는 좀 더 뒤에서 다루겠다. )

<Early Return>을 활용해 해당 함수를 개선해보자.

```js
//good
function executeUserLogic(alphabet, number, korean) {
    if (alphabet !== "PAID") return;
    if (number <= 20) return logic3();
    if (korean !== "korean") return logic2();
    return logic1();
}
```

상하좌우 보다 간결해졌다. 본능적으로 가독성이 높아졌음을 알 수 있다.

(하지만 조건이 복잡하다면 EALRY RETURN 이 무조건 옳다고 보긴 힘들다.)

경우의 수가 한 가지 늘어

좋은 분기문을 작성해야하는 이유

목적1 : 가독성을 높혀 로직을 쉽게 이해하기 위하여?

코드 작성 시 if, for문 등에서 들여쓰기(indent)를 쓰게 된다. 들여쓰기가 많아질수록 가독성과 유지보수의 용이함을 저해하는 경우가 생긴다.

목적2 :

1. 가독성
2.

1. EARLY RETURN, FAST EXIT

4. SWITCH 분기

2. && 와 || 적절히 활용하기 (short circuit)

3. 삼항연산자

3. JSON 분기

5. MAP 분기 (2개 컨디션)
   => 함수로 해결하는게 낫다.

6. 함수 분기

3. 하지만 분기가 많은게 나을때도 있다.