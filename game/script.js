const globals = {
    game: {
        questionTypes: [],
        timer: false,
        intervalId: false,
        score: {
            correct: 0,
            incorrect: 0,
        },
        answerTimes: [],
    },
}

function startGame(e) {
    const parsedUrl = new URL(window.location.href);
    const questionTypes = parsedUrl.searchParams.getAll('question_types');
    const multiplicationDigits = parsedUrl.searchParams.getAll('multiplication_digits');
    const additionDigits = parsedUrl.searchParams.getAll('addition_digits');
    const subtractionDigits = parsedUrl.searchParams.getAll('subtraction_digits');
    const includeSubtractionNegatives = parsedUrl.searchParams.get('include_negatives');

    globals.game['questionTypes'] = questionTypes;
    globals.game['multiplicationDigits'] = multiplicationDigits;
    globals.game['additionDigits'] = additionDigits;
    globals.game['subtractionDigits'] = subtractionDigits;
    globals.game['includeSubtractionNegatives'] = includeSubtractionNegatives;

    document.querySelector('.js-show-answer').addEventListener('click', function() { renderAnswer(question) });
    const yourAnswer = document.querySelectorAll('.js-your-answer');
    yourAnswer.forEach(function(answerBtn) {
        answerBtn.addEventListener('click', function(e) { handleRightWrong(e) });
    });

    newQuestion();
}

function newQuestion() {
    const type = getRandomElement(globals.game['questionTypes']);
    const numDigits = getRandomElement(globals.game[type + 'Digits']);
    const digitsArr = getDigitsArr(numDigits);
    question = generateQuestion(type, ...digitsArr);
    if (type === 'subtraction' && !globals.game['includeSubtractionNegatives']) {
        if (question.second > question.first) {
            // Re-order the question so the largest number is on the left hand side
            const tempSecond = question.second;
            question.second = question.first;
            question.first = tempSecond;
        }
    }
    renderQuestion(question);
    startTimer();
}

/**
 * Translate string into array of two integers
 * @param {string} numDigits 
 */
function getDigitsArr(numDigits) {
    return numDigits.split('x');
}

function generateQuestion(type, firstNumDigits, secondNumDigits) {
    const firstNumExcludeNums = getExcludeNums(type, firstNumDigits);
    const secondNumExcludeNums = getExcludeNums(type, secondNumDigits);
    const first = getNumber(firstNumDigits, firstNumExcludeNums);
    const second = getNumber(secondNumDigits, secondNumExcludeNums);    

    const question = {
        'first': first,
        'second': second,
        'type': type,
        'firstNumDigits': firstNumDigits,
        'secondNumDigits': secondNumDigits,
    }

    return question;
}

/**
 * Return an array of numbers that can't be included for the number of digits
 * @param {string} type 
 * @param {string|integer} numDigits 
 * @returns {array}
 */
function getExcludeNums(type, numDigits) {
    const excludeNums = [];
    if (parseInt(numDigits) === 1) {
        // Avoid questions such as 0 + 0
        excludeNums.push(0);

        if (type === 'multiplication') {
            // Avoid questions such as 1 x 1
            excludeNums.push(1);
        }
    }

    return excludeNums;
}

function getRandomDigit() {
    return Math.round(Math.random() * 9);
}

function getNumber(numDigits, excludeNums = []) {
    let number = '';

    for (let i = 0; i < numDigits; i++) {
        let randomDigit = getRandomDigit();
        while (i === 0 && numDigits > 1 && randomDigit === 0 || excludeNums.includes(randomDigit)) {
            randomDigit = getRandomDigit();
        }
        number += randomDigit;
    }

    return parseInt(number);
}

function getSymbol(type) {
    let symbol;

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
    const symbol = getSymbol(question.type);
    const questionText = `${question.first} ${symbol} ${question.second}`;

    document.querySelector('.js-answer-help').textContent = '';
    document.querySelector('.js-question').textContent = questionText;
    document.querySelector('.js-show-answer').style.display = 'block';
    document.querySelector('.js-answer-text').style.display = 'none';
}

function renderAnswer(question) {
    stopTimer();
    const answer = getAnswer(question);
    document.querySelector('.js-show-answer').style.display = 'none';
    document.querySelector('.js-answer-text').style.display = 'inline-block';
    document.querySelector('.js-answer-text').textContent = answer;

    document.querySelector('.js-right-wrong').style.display = 'block';

    updateAnswerHelp(question);
    updateAverageTimeToAnswer();
}

function getAnswer(question) {
    let answer;

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

function updateAverageTimeToAnswer() {
    globals.game.answerTimes.push(parseInt(document.querySelector('.js-timer').textContent));
    const totalAnswerTime = globals.game.answerTimes.reduce(function(accumulator, answerTime) {
        return accumulator + answerTime;
    }, 0);
    const averageTimeToAnswer = Math.round(totalAnswerTime / globals.game.answerTimes.length);
    document.querySelector('.js-average-time').textContent = averageTimeToAnswer;
}

function updateAnswerHelp(question) {
    if (
        !(question.type === 'multiplication' &&
        parseInt(question.firstNumDigits) === 2 && parseInt(question.secondNumDigits) === 2)
    ) {
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
            answerHelp = getMultiplicationAdditionMethodHelpTextWithLabel(question);
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

    const isEitherNumberLessThanSix = getDigit(question.first, 1) <= 5 || getDigit(question.second, 1) <= 5;

    if (firstDistanceToTen === secondDistanceToTen && isEitherNumberLessThanSix) {
        return shouldUseSubtractionMethod;
    }

    const areBothNumbersGreaterThanFive = getDigit(question.first, 1) > 5 && getDigit(question.second, 1) > 5;

    if (areBothNumbersGreaterThanFive) {
        shouldUseSubtractionMethod = true;
    } else {
        const smallestDistanceToTenKey = secondDistanceToTen > firstDistanceToTen ? 'first' : 'second';
        const furthestDistanceKey = smallestDistanceToTenKey === 'first' ? 'second' : 'first';

        if (getDigit(question[smallestDistanceToTenKey], 1) <= 5) {
            return shouldUseSubtractionMethod;
        }

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
    let answerHelp = `Method: subtraction`;

    const subtractionQuestion = getSubtractionMethodQuestion(question);
    answerHelp += getMultiplicationAdditionMethodHelpText(subtractionQuestion);

    // Add the subtraction part
    const keyOfNumberToRoundUp = getClosestSecondDigitToTen(question);
    const multiplicationToSubtract = 10 - (getDigit(question[keyOfNumberToRoundUp], 1) % 10);
    const keyOfNumberToSubtract = keyOfNumberToRoundUp === 'first' ? 'second' : 'first';
    const amountToSubtract = multiplicationToSubtract * question[keyOfNumberToSubtract];
    const amountToSubtractQuestionText = multiplicationToSubtract > 1 ? `${multiplicationToSubtract} * ${subtractionQuestion.second} = ` : '';
    const subtractionQuestionAnswer = getAnswer(subtractionQuestion);
    const finalAnswer = subtractionQuestionAnswer - amountToSubtract;
    answerHelp += `\nAmount to subtract: ${amountToSubtractQuestionText} ${amountToSubtract}
    Answer: ${subtractionQuestionAnswer} - ${amountToSubtract} = ${finalAnswer}`;

    return answerHelp;
}

function getSubtractionMethodQuestion(question) {
    const keyOfNumberToRoundUp = getClosestSecondDigitToTen(question);
    const firstRoundedUp = question[keyOfNumberToRoundUp] + (10 - question[keyOfNumberToRoundUp] % 10);

    const subtractionQuestion = {
        type: 'multiplication',
        first: firstRoundedUp,
        second: keyOfNumberToRoundUp === 'first' ? question.second : question.first,
    };

    return subtractionQuestion;
}

function getClosestSecondDigitToTen(question) {
    let closestSecondDigitToTen;

    const firstSecondDigitDistanceToTen = getDistanceToNearestTen(getDigit(question.first, 1));
    const secondSecondDigitDistanceToTen = getDistanceToNearestTen(getDigit(question.second, 1));

    if (firstSecondDigitDistanceToTen === secondSecondDigitDistanceToTen) {
        // use whichever has largest first digit to make the addition easier
        closestSecondDigitToTen = getDigit(question.second, 0) > getDigit(question.first, 0) ? 'second' : 'first';
    } else {
        closestSecondDigitToTen = (firstSecondDigitDistanceToTen < secondSecondDigitDistanceToTen) ? 'first' : 'second';
    }

    return closestSecondDigitToTen;
}

function getMultiplicationAdditionMethodHelpTextWithLabel(question) {
    let answerHelp = 'Answer method: addition';
    answerHelp += getMultiplicationAdditionMethodHelpText(question);

    return answerHelp;
}

function getMultiplicationAdditionMethodHelpText(question) {
    closestSecondDigitToTen = getClosestSecondDigitToTen(question);
    
    let leftMultiplier, rightMultiplier;
    if (closestSecondDigitToTen === 'first') {
        leftMultiplier = question.first;
        rightMultiplier = question.second;
    } else {
        leftMultiplier = question.second;
        rightMultiplier = question.first;
    }

    const leftFirstDigitMultiplier = leftMultiplier === 100 ? 100 : getDigit(leftMultiplier, 0) * 10;
    const leftSecondDigit = getDigit(leftMultiplier, 1);
    const rightFirstDigitMultiplier = getDigit(rightMultiplier, 0) * 10;
    const rightSecondDigit = getDigit(rightMultiplier, 1);

    const stepOne = leftFirstDigitMultiplier * rightFirstDigitMultiplier;
    const stepTwo = leftFirstDigitMultiplier * rightSecondDigit;
    const stepThree = stepOne + stepTwo;
    const stepFour = leftSecondDigit * rightMultiplier;
    const stepFive = stepThree + stepFour

    
    let answerHelp = leftFirstDigitMultiplier > 1 && rightFirstDigitMultiplier > 1 ? `\n${leftFirstDigitMultiplier} * ${rightFirstDigitMultiplier} = ${stepOne}` : '';
    answerHelp += leftFirstDigitMultiplier > 1 && rightSecondDigit > 1 ? `\n${leftFirstDigitMultiplier} * ${rightSecondDigit} = ${stepTwo}` : '';
    answerHelp += stepOne && stepTwo ? `\n${stepOne} + ${stepTwo} + ${stepThree}` : '';
    answerHelp += leftSecondDigit > 1 && rightMultiplier > 1 ? `\n${leftSecondDigit} * ${rightMultiplier} = ${stepFour}` : '';
    answerHelp += stepThree && stepFour ? `\n${stepThree} + ${stepFour} = ${stepFive}` : '';

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