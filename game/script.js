var globals = {
    game: {
        questionTypes: [],
        timer: false,
        intervalId: false,
    },
}

function startGame(e) {
    const parsedUrl = new URL(window.location.href);
    var questionTypes = parsedUrl.searchParams.getAll('question_types');
    var multiplicationDigits = parsedUrl.searchParams.getAll('multiplication_digits');
    var additionDigits = parsedUrl.searchParams.getAll('addition_digits');
    var subtractionDigits = parsedUrl.searchParams.getAll('subtraction_digits');

    globals.game['questionTypes'] = questionTypes;
    globals.game['multiplicationDigits'] = multiplicationDigits;
    globals.game['additionDigits'] = additionDigits;
    globals.game['subtractionDigits'] = subtractionDigits;

    document.querySelector('.js-show-answer').addEventListener('click', function() { renderAnswer(question) });

    newQuestion();
}

function newQuestion(numDigits) {
    var type = getRandomElement(globals.game['questionTypes']);
    var numDigits = getRandomElement(globals.game[type + 'Digits']);
    question = generateQuestion(type, numDigits);
    renderQuestion(question);
    startTimer();
}

function generateQuestion(type, numDigits) {
    var first = getNumber(numDigits);
    var second = getNumber(numDigits);

    var question = {
        'first': first,
        'second': second,
        'type': type,
        'numDigits': numDigits,
    }

    return question;
}

function getRandomDigit() {
    return Math.round(Math.random() * 9);
}

function getNumber(numDigits) {
    var number = '';

    for (let i = 0; i < numDigits; i++) {
        number += getRandomDigit();
    }

    return parseInt(number);
}

function getSymbol(type) {
    var symbol;

    switch (type) {
        case 'multiplication':
            symbol = 'x';
            break;
        case 'addition':
            symbol = '+';
            break;
        case 'subtraction':
            symbol = '-';
            break;
        default:
            break;
    }

    return symbol;
}

function renderQuestion(question) {
    var symbol = getSymbol(question.type);
    var questionText = `${question.first} ${symbol} ${question.second}`;

    document.querySelector('.js-question').textContent = questionText;
    document.querySelector('.js-show-answer').style.display = 'block';
    document.querySelector('.js-answer').style.display = 'none';
    document.querySelector('.js-answer-text').style.display = 'none';
}

function renderAnswer(question) {
    stopTimer();
    var answer = getAnswer(question);
    document.querySelector('.js-show-answer').style.display = 'none';
    document.querySelector('.js-answer').style.display = 'block';
    document.querySelector('.js-answer-text').style.display = 'inline-block';
    document.querySelector('.js-answer-text').textContent = answer;
    document.querySelector('.js-next-question').addEventListener('click', function() { newQuestion() });
}

function getAnswer(question) {
    var answer;

    switch (question.type) {
        case 'multiplication':
            answer = question.first * question.second
            break;
        case 'addition':
            answer = question.first + question.second
            break;
        case 'subtraction':
            answer = question.first - question.second
            break;
        default:
            break;
    }

    return answer;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function startTimer() {
    if (!globals.intervalId) {
        globals.isTimerRunning = true;
        globals.timer = 0;
        document.querySelector('.js-timer').textContent = globals.timer;
    }

    globals.intervalId = window.setInterval(function() {
        globals.timer++;
        document.querySelector('.js-timer').textContent = globals.timer;
    }, 1000);
}

function stopTimer() {
    clearInterval(globals.intervalId);
    globals.intervalId = false;
}

startGame();