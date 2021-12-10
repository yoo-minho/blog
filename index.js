window.addEventListener('DOMContentLoaded', function () {
    const ifBtn = document.createElement('button');
    ifBtn.textContent = 'if';
    ifBtn.addEventListener("click", function () {
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