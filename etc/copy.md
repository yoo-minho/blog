swallow copy vs deep copy

뭔가 이상하다고 느낀 지점

```js
const user1 = {
    name:'minho',
    age:30
}

changeName(user1);
changeAge(user1);
console.log(user1);

function changeName(user, name){
    const user2 = user;
    user2.name = 'smith';
    console.log(user2);
}

function changeAge(user){
    const user3 = user;
    user3.age = 20;
    console.log(user3);
}

```

그리고 왜 const는 불변한데 바뀌는가?