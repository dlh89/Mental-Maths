var globals = {
    game: {
        questionTypes: [],
        timer: false,
        intervalId: false,
        score: {
            correct: 0,
            incorrect: 0,
        }
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
    const yourAnswer = document.querySelectorAll('.js-your-answer');
    yourAnswer.forEach(function(answerBtn) {
        answerBtn.addEventListener('click', function(e) { handleRightWrong(e) });
    });

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

    document.querySelector('.js-answer-help').textContent = '';
    document.querySelector('.js-question').textContent = questionText;
    document.querySelector('.js-show-answer').style.display = 'block';
    document.querySelector('.js-answer-text').style.display = 'none';
}

function renderAnswer(question) {
    stopTimer();
    var answer = getAnswer(question);
    document.querySelector('.js-show-answer').style.display = 'none';
    document.querySelector('.js-answer-text').style.display = 'inline-block';
    document.querySelector('.js-answer-text').textContent = answer;

    document.querySelector('.js-right-wrong').style.display = 'block';

    updateAnswerHelp(question);
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
        globals.timer = 0;
        document.querySelector('.js-timer').textContent = globals.timer;
    }

    globals.intervalId = window.setInterval(function() {
        globals.timer++;
        document.querySelector('.js-timer').textContent = globals.timer;
    }, 1000);
}

function stopTimer() {
    window.clearInterval(globals.intervalId);
    globals.intervalId = false;
}

function handleRightWrong(e) {
    const answer = e.target.getAttribute('data-your-answer');
    if (answer === 'right') {
        globals.game.score.correct++;
        document.querySelector('.js-correct-score').textContent = globals.game.score.correct;
    } else {
        globals.game.score.incorrect++;
        document.querySelector('.js-incorrect-score').textContent = globals.game.score.incorrect;
    }

    document.querySelector('.js-right-wrong').style.display = 'none';
    newQuestion();
}

function updateAnswerHelp(question) {
    if (question.type !== 'multiplication' && parseInt(question.numDigits) !== 2)
    {
        return;
    }

    let answerHelp = '';

    // Determine the easiest method
    if (question.first === question.second) {
        answerHelp = getSquareHelpText(question);
    } else if (question.first === 11 || question.second === 11) {
        answerHelp = getMultiplicationByElevenHelpText(question);
    } else if (question.first.toString()[1] > 7 && question.second.toString()[1] > 7) {
        answerHelp = getMultiplicationSubtractionMethodHelpText(question);
    } else {
        if (shouldUseSubtractionMethod(question)) {
            answerHelp = getMultiplicationSubtractionMethodHelpText(question);
        } else {
            answerHelp = getMultiplicationAdditionMethodHelpText(question);
        }
    }

    document.querySelector('.js-answer-help').innerText = answerHelp;
}

function shouldUseSubtractionMethod(question) {
    let shouldUseSubtractionMethod = false;

    const isFirstNumberEightOrNine = parseInt(question.first.toString()[1]) === 8 || parseInt(question.first.toString()[1]) === 9;
    const isSecondNumberEightOrNine = parseInt(question.first.toString()[1]) === 8 || parseInt(question.first.toString()[1]) === 9;

    if (!isFirstNumberEightOrNine && !isSecondNumberEightOrNine) {
        return shouldUseSubtractionMethod;
    }

    const firstDistanceToTen = getDistanceToNearestTen(question.first.toString()[1]);
    const secondDistanceToTen = getDistanceToNearestTen(question.second.toString()[1]);
    const areBothNumbersLessThanSix = question.first.toString()[1] < 6 && question.second.toString()[1] < 6;

    if ((firstDistanceToTen > 2 && secondDistanceToTen > 2) || areBothNumbersLessThanSix) {
        return shouldUseSubtractionMethod;
    }

    const areBothNumbersGreaterThanFive = question.first.toString()[1] > 5 && question.second.toString()[1] > 5;

    if (areBothNumbersGreaterThanFive) {
        shouldUseSubtractionMethod = true;
    } else {
        const smallestDistanceToTenKey = secondDistanceToTen > firstDistanceToTen ? 'first' : 'second';
        const furthestDistanceKey = smallestDistanceToTenKey === 'first' ? 'second' : 'first';
        let distanceThreshold;

        if (parseInt(question[smallestDistanceToTenKey].toString()[1]) === 9) {
            distanceThreshold = 2;
        } else {
            // smallest must be an 8 (i.e. 2 from 10) if we get here
            distanceThreshold = 3;
        }

        if (question[furthestDistanceKey].toString()[1] > distanceThreshold) {
            shouldUseSubtractionMethod = true;
        }
    }

    return shouldUseSubtractionMethod;
}

function getDistanceToNearestTen(n) {
    let distanceToTen;

    if (n > 5) {
        distanceToTen = 10 % n;
    } else {
        distanceToTen = n % 10;
    }

    return distanceToTen;
}

function getSquareHelpText(question) {
    const shouldRoundUp = question.first.toString()[1] > 5;
    const distanceToTen = question.first.toString()[1] % 10;
    const leftMultiplier = shouldRoundUp ? (question.first.toString()[0] + 1) * 10: question.first.toString()[0] * 10;
    const rightMultiplier = question.first.toString()[0] + (distanceToTen * 2);
    const squareOfDistanceToTen = distanceToTen * distanceToTen;
    const answerHelp = `Answer method: square
    Should you round up? ${shouldRoundUp}
    Distance to nearest 10: ${distanceToTen}
    ${leftMultiplier} * ${rightMultiplier} = ${leftMultiplier * rightMultiplier}
    Square of distance to 10 = ${squareOfDistanceToTen}
    ${leftMultiplier * rightMultiplier} + ${squareOfDistanceToTen} = ${(leftMultiplier * rightMultiplier) + squareOfDistanceToTen}`;

    return answerHelp;
}

function getMultiplicationByElevenHelpText(question) {
    // TODO
    const answerHelp = `Method: multiply by 11 shortcut`;

    return answerHelp;
}

function getMultiplicationSubtractionMethodHelpText(question) {
    // TODO
    const answerHelp = `Method: subtraction`;

    return answerHelp;
}

function getMultiplicationAdditionMethodHelpText(question) {
    // TODO if both same, use bigger number
    const closestSecondDigitToTen = (10 - question.first.toString()[1]) > (10 - question.second.toString()[1]) ? 'first' : 'second';
    let leftMultiplier, rightMultiplier;
    if (closestSecondDigitToTen === 'first') {
        leftMultiplier = question.first;
        rightMultiplier = question.second;
    } else {
        leftMultiplier = question.second;
        rightMultiplier = question.first;
    }

    const stepOne = (leftMultiplier.toString()[0] * 10) * (rightMultiplier.toString()[0] * 10);
    const stepTwo = (leftMultiplier.toString()[0] * 10) * rightMultiplier.toString()[1];
    const stepThree = stepOne + stepTwo;
    const stepFour = leftMultiplier.toString()[1] * rightMultiplier;
    const stepFive = stepThree + stepFour

    const answerHelp = `Answer method: addition
    ${leftMultiplier.toString()[0] * 10} * ${rightMultiplier.toString()[0] * 10} = ${stepOne}
    ${leftMultiplier.toString()[0] * 10} * ${rightMultiplier.toString()[1]} = ${stepTwo}
    ${stepOne} + ${stepTwo} + ${stepThree}
    ${leftMultiplier.toString()[1]} * ${rightMultiplier} = ${stepFour}
    ${stepThree} + ${stepFour} = ${stepFive}
    `;

    return answerHelp;
}

startGame();