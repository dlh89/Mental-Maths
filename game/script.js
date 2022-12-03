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
        var randomDigit = getRandomDigit();
        while (i === 0 && numDigits > 1 && randomDigit === 0) {
            randomDigit = getRandomDigit();
        }
        number += randomDigit;
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
    } else if (canUseEvensAddToTen(question)) {
        answerHelp = getMatchingFirstDigitsAndSecondDigitsAddToTen(question);
    } else if (getDigit(question.first, 1) > 7 && getDigit(question.second, 1) > 7) {
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

    const isFirstNumberEightOrNine = getDigit(question.first, 1) === 8 || getDigit(question.first, 1) === 9;
    const isSecondNumberEightOrNine = getDigit(question.second, 1) === 8 || getDigit(question.second, 1) === 9;

    if (!isFirstNumberEightOrNine && !isSecondNumberEightOrNine) {
        return shouldUseSubtractionMethod;
    }

    const firstDistanceToTen = getDistanceToNearestTen(getDigit(question.first, 1));
    const secondDistanceToTen = getDistanceToNearestTen(getDigit(question.second, 1));
    const areBothNumbersLessThanSix = getDigit(question.first, 1) < 6 && getDigit(question.second, 1) < 6;

    if ((firstDistanceToTen > 2 && secondDistanceToTen > 2) || areBothNumbersLessThanSix) {
        return shouldUseSubtractionMethod;
    }

    const areBothNumbersGreaterThanFive = getDigit(question.first, 1) > 5 && getDigit(question.second, 1) > 5;

    if (areBothNumbersGreaterThanFive) {
        shouldUseSubtractionMethod = true;
    } else {
        const smallestDistanceToTenKey = secondDistanceToTen > firstDistanceToTen ? 'first' : 'second';
        const furthestDistanceKey = smallestDistanceToTenKey === 'first' ? 'second' : 'first';
        let distanceThreshold;

        if (getDigit(question[smallestDistanceToTenKey], 1) === 9) {
            distanceThreshold = 2;
        } else {
            // smallest must be an 8 (i.e. 2 from 10) if we get here
            distanceThreshold = 3;
        }

        if (getDigit(question[furthestDistanceKey], 1) > distanceThreshold) {
            shouldUseSubtractionMethod = true;
        }
    }

    return shouldUseSubtractionMethod;
}

function canUseEvensAddToTen(question) {
    let canUse = false;

    if (getDigit(question.first, 0) === getDigit(question.second, 0) &&
        getDigit(question.first, 1) + getDigit(question.second, 1) === 10
    ) {
        canUse = true;
    }

    return canUse;
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
    const shouldRoundUp = getDigit(question.first, 1) > 5;
    const distanceToTen = getDigit(question.first, 1) % 10 > 5 ? 10 - (getDigit(question.first, 1) % 10) : getDigit(question.first, 1) % 10;
    const leftMultiplier = shouldRoundUp ? ((getDigit(question.first, 0)) + 1) * 10: getDigit(question.first, 0) * 10;
    const rightMultiplier = shouldRoundUp ? (question.first.toString()) - distanceToTen : leftMultiplier + (distanceToTen * 2);
    const squareOfDistanceToTen = distanceToTen * distanceToTen;
    const answerHelp = `Answer method: square
    Should you round up? ${shouldRoundUp}
    Distance to nearest 10: ${distanceToTen}
    ${leftMultiplier} * ${rightMultiplier} = ${leftMultiplier * rightMultiplier}
    Square of distance to 10: ${distanceToTen} * ${distanceToTen} = ${squareOfDistanceToTen}
    ${leftMultiplier * rightMultiplier} + ${squareOfDistanceToTen} = ${(leftMultiplier * rightMultiplier) + squareOfDistanceToTen}`;

    return answerHelp;
}

function getMultiplicationByElevenHelpText(question) {
    const firstDigit = getDigit(question.first, 0);
    const secondDigit = getDigit(question.first, 1);
    const addition = firstDigit + secondDigit;
    let answer;
    let answerAdditionString;
    if (addition > 9) {
        answer = ((firstDigit * 10) + addition).toString() + secondDigit;
        answerAdditionString = `(${(firstDigit * 10)} + ${addition}) = ${(firstDigit * 10) + addition}
        (${(firstDigit * 10) + addition})${secondDigit}`
    } else {
        answer = firstDigit.toString() + addition + secondDigit.toString();
        answerAdditionString = `${firstDigit.toString()}(${firstDigit + secondDigit})${secondDigit.toString()}`;
    }
    const answerHelp = `Method: multiply by 11 shortcut
    ${firstDigit} + ${secondDigit} = ${firstDigit + secondDigit}
    ${answerAdditionString}
    Answer: ${answer}`;

    return answerHelp;
}

function getMatchingFirstDigitsAndSecondDigitsAddToTen(question) {
    const firstPart = ((getDigit(question.first, 0) * 10) * (getDigit(question.first, 0) + 1) * 10);
    const secondPart = getDigit(question.first, 1) * getDigit(question.second, 1);
    const answerHelp = `Method: Matching first digits and second digits add up to 10 trick
    ${getDigit(question.first, 0) * 10} * ${(getDigit(question.first, 0) + 1) * 10} = ${firstPart}
    ${getDigit(question.first, 1)} * ${getDigit(question.second, 1)} = ${secondPart}
    ${firstPart} + ${secondPart} = ${firstPart + secondPart}`;

    return answerHelp;
}

function getMultiplicationSubtractionMethodHelpText(question) {
    // TODO
    const answerHelp = `Method: subtraction`;

    return answerHelp;
}

function getMultiplicationAdditionMethodHelpText(question) {
    const firstSecondDigitDistanceToTen = 10 - getDigit(question.first, 1);
    const secondSecondDigitDistanceToTen = 10 - getDigit(question.second, 1);
    let closestSecondDigitToTen;
    if (firstSecondDigitDistanceToTen === secondSecondDigitDistanceToTen) {
        // use whichever has largest first digit to make the addition easier
        closestSecondDigitToTen = getDigit(question.second, 0) > getDigit(question.first, 0) ? 'second' : 'first';
    } else {
        closestSecondDigitToTen = (firstSecondDigitDistanceToTen > secondSecondDigitDistanceToTen) ? 'first' : 'second';
    }
    let leftMultiplier, rightMultiplier;
    if (closestSecondDigitToTen === 'first') {
        leftMultiplier = question.first;
        rightMultiplier = question.second;
    } else {
        leftMultiplier = question.second;
        rightMultiplier = question.first;
    }

    const stepOne = (getDigit(leftMultiplier, 0) * 10) * (getDigit(rightMultiplier, 0) * 10);
    const stepTwo = (getDigit(leftMultiplier, 0) * 10) * getDigit(rightMultiplier, 1);
    const stepThree = stepOne + stepTwo;
    const stepFour = getDigit(leftMultiplier, 1) * rightMultiplier;
    const stepFive = stepThree + stepFour

    const answerHelp = `Answer method: addition
    ${getDigit(leftMultiplier, 0) * 10} * ${getDigit(rightMultiplier, 0) * 10} = ${stepOne}
    ${getDigit(leftMultiplier, 0) * 10} * ${getDigit(rightMultiplier, 1)} = ${stepTwo}
    ${stepOne} + ${stepTwo} + ${stepThree}
    ${getDigit(leftMultiplier, 1)} * ${rightMultiplier} = ${stepFour}
    ${stepThree} + ${stepFour} = ${stepFive}
    `;

    return answerHelp;
}

/**
 * Get zero-indexed digit of a number as an integer
 *
 * @param {integer|string} number The number to parse
 * @param {integer|string} digit Zero-indexed digit to get
 * @returns {integer}
 */
function getDigit(number, digit) {
    return parseInt(number.toString()[digit]);
}

startGame();