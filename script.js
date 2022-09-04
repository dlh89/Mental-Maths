document.querySelector('.js-start-form').addEventListener('submit', startGame);

var globals = {
    game: {
        questionTypes: [],
    },
}

function startGame(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var questionTypes = formData.getAll('question_types');

    globals.game['questionTypes'] = questionTypes;

    document.querySelector('.js-pre-start').style.display = 'none';
    document.querySelector('.js-game').style.display = 'block';
    document.querySelector('.js-show-answer').addEventListener('click', function() { renderAnswer(question) });

    newQuestion(2);
}

function newQuestion(numDigits) {
    var type = globals.game['questionTypes'][Math.floor(Math.random() * globals.game['questionTypes'].length)];
    question = generateQuestion(type, numDigits);
    renderQuestion(question);
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

    return number;
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
    var answer = getAnswer(question);
    document.querySelector('.js-show-answer').style.display = 'none';
    document.querySelector('.js-answer').style.display = 'block';
    document.querySelector('.js-answer-text').style.display = 'inline-block';
    document.querySelector('.js-answer-text').textContent = answer;
    document.querySelector('.js-next-question').addEventListener('click', function() { newQuestion(question.numDigits) });
}

function getAnswer(question) {
    var answer;

    switch (question.type) {
        case 'multiplication':
            answer = question.first * question.second
            break;
        case 'addition':
            answer = parseInt(question.first) + parseInt(question.second)
            break;
        case 'subtraction':
            answer = parseInt(question.first) - parseInt(question.second)
            break;
        default:
            break;
    }

    return answer;
}