window.addEventListener('DOMContentLoaded', function () {
    const ifBtn = document.createElement('button');
    ifBtn.textContent = 'if';
    ifBtn.addEventListener("click", function () {
        getMinNumberIf(35);
        return;
        //console.log('if', getFruitEmojiByIf('lemon'));
        console.time('if');
        let v;
        for (let i = 0 ; i < 10000 ; i++){
            v += getFruitEmojiByIf('lemon');
        }
        console.log(v);
        console.timeEnd('if');
    });

    const switchBtn = document.createElement('button');
    switchBtn.textContent = 'switch';
    switchBtn.addEventListener("click", function () {
        getMinNumberSwitch(35);
        return;
        //console.log('switch', getFruitEmojiBySwitch('lemon'));
        console.time('switch');
        let v;
        for (let i = 0 ; i < 10000 ; i++){
            v += getFruitEmojiBySwitch('lemon')
        }
        console.log(v);
        console.timeEnd('switch');
    });

    const body = document.querySelector("body");
    body.append(ifBtn);
    body.append(switchBtn);
})

function getFruitEmojiByIf(name) {
    let emoji;
    if (name === 'apple') {
        emoji = '🍎';
    } else if (name === 'pi1neapple') {
        emoji = '🍍';
    } else if (name === 'banana') {
        emoji = '🍌'
    } else if (name === 'kiwi') {
        emoji = '🥝'
    } else if (name === 'lemon') {
        emoji = '🍋'
    } else {
        emoji = '';
    }
    return emoji;
}

function getFruitEmojiBySwitch(name) {
    switch (name) {
        case 'apple' :
            return '🍎';
        case 'pineapple' :
            return '🍍';
        case 'banana' :
            return '🍌';
        case 'kiwi' :
            return '🥝';
        case 'lemon' :
            return '🍋';
        default :
            return '';
    }
}

function getMinNumberSwitch(n) {
    switch (true) {
        case (n >= 0 && n < 10) :
            return 0;
        case (n >= 10 && n < 20) :
            return 10;
        case (n >= 20 && n < 30) :
            return 20;
        case (n >= 30 && n < 40) :
            return 30;
        default :
            return 0;
    }
}

function getMinNumberIf(n) {
    if (n >= 0 && n < 10) {
        return 0;
    } else if (n >= 10 && n < 20) {
        return 10;
    } else if (n >= 20 && n < 30) {
        return 20;
    } else if (n >= 30 && n < 40) {
        return 30;
    } else {
        return 0;
    }
}