class Main
{   
    static arithmeticTypes = [
        'multiplication',
        'addition',
        'subtraction',
    ];

    constructor() {
        const parsedUrl = new URL(window.location.href);
        const questionTypes = parsedUrl.searchParams.getAll('question_types');
        const multiplicationDigits = parsedUrl.searchParams.getAll('multiplication_digits');
        const additionDigits = parsedUrl.searchParams.getAll('addition_digits');
        const subtractionDigits = parsedUrl.searchParams.getAll('subtraction_digits');
        const includeSubtractionNegatives = parsedUrl.searchParams.get('include_negatives');

        this.validateQuestionTypes(questionTypes);
    
        this.questionTypes = questionTypes;
        this.multiplicationDigits = multiplicationDigits;
        this.additionDigits = additionDigits;
        this.subtractionDigits = subtractionDigits;
        this.includeSubtractionNegatives = includeSubtractionNegatives;
        
        this.score = {
            correct: 0,
            incorrect: 0,
        };

        this.timer = false;
        this.intervalId = false;
        this.answerTimes = [];
        this.question = {};
        this.type;
    }

    validateQuestionTypes() {
        if (!Main.arithmeticTypes.includes(this.type)) {
            console.error('Question type doesn\'t exist.');
        }
    }

    startGame() {
        document.querySelector('.js-show-answer').addEventListener('click', this.renderAnswer.bind(this));
        const yourAnswer = document.querySelectorAll('.js-your-answer');

        yourAnswer.forEach(answerBtn => {
            answerBtn.addEventListener('click', (e) => this.handleEvaluation.call(this, e));
        });
    
        this.newQuestion();
    }
    
    newQuestion() {
        this.type = this.getRandomElement(this.questionTypes);
        const arithmeticTypeDigits = this.getArithmeticTypeDigits();
        const numDigits = this.getRandomElement(arithmeticTypeDigits);
        const digitsArr = this.getDigitsArr(numDigits);
        const question = this.generateQuestion(this.type, ...digitsArr);
        if (this.type === 'subtraction' && !this.includeSubtractionNegatives) {
            if (question.second > question.first) {
                // Re-order the question so the largest number is on the left hand side
                const tempSecond = question.second;
                question.second = question.first;
                question.first = tempSecond;
            }
        }
        this.question = question;
        this.renderQuestion(question);
        this.startTimer();
    }

    getArithmeticTypeDigits() {
        let arithmeticTypeDigits = false;

        switch (this.type) {
            case 'multiplication':
                arithmeticTypeDigits = this.multiplicationDigits;
                break;
            case 'addition':
                arithmeticTypeDigits = this.additionDigits;
                break;
            case 'subtraction':
                arithmeticTypeDigits = this.subtractionDigits;
                break;
            default:
                break;
        }

        return arithmeticTypeDigits;
    }
    
    /**
     * Translate string into array of two integers
     * @param {string} numDigits 
     */
    getDigitsArr(numDigits) {
        return numDigits.split('x');
    }
    
    generateQuestion(type, firstNumDigits, secondNumDigits) {
        const firstNumExcludeNums = this.getExcludeNums(type, firstNumDigits);
        const secondNumExcludeNums = this.getExcludeNums(type, secondNumDigits);
        const first = this.getNumber(firstNumDigits, firstNumExcludeNums);
        const second = this.getNumber(secondNumDigits, secondNumExcludeNums);    
    
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
    getExcludeNums(type, numDigits) {
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
    
    /**
     * Return a random number between 0 and 9
     * @returns {integer}
     */
    getRandomDigit() {
        return Math.round(Math.random() * 9);
    }
    
    /**
     * Return a random number with the number of digits given
     * 0 will not be used for the first digit and any number in excludeNums will not be used
     * @param {integer} numDigits 
     * @param {array} excludeNums 
     * @returns {integer}
     */
    getNumber(numDigits, excludeNums = []) {
        let number = '';
    
        for (let i = 0; i < numDigits; i++) {
            let randomDigit = this.getRandomDigit();
            while (i === 0 && numDigits > 1 && randomDigit === 0 || excludeNums.includes(randomDigit)) {
                randomDigit = this.getRandomDigit();
            }
            number += randomDigit;
        }
    
        return parseInt(number);
    }
    
    /**
     * Get the symbol for the given mathematical string
     * @param {string} type 
     * @returns {string}
     */
    getSymbol(type) {
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
    
    renderQuestion(question) {
        const symbol = this.getSymbol(question.type);
        const questionText = `${question.first} ${symbol} ${question.second}`;
    
        document.querySelector('.js-answer-help').textContent = '';
        document.querySelector('.js-question').textContent = questionText;
        document.querySelector('.js-show-answer').style.display = 'block';
        document.querySelector('.js-answer-text').style.display = 'none';
    }
    
    renderAnswer() {
        this.stopTimer();
        const answer = this.getAnswer(this.question);
        document.querySelector('.js-show-answer').style.display = 'none';
        document.querySelector('.js-answer-text').style.display = 'inline-block';
        document.querySelector('.js-answer-text').textContent = answer;
    
        document.querySelector('.js-right-wrong').style.display = 'block';
    
        this.updateAnswerHelp(this.question);
        this.updateAverageTimeToAnswer();
    }
    
    /**
     * Return the answer for the given question
     * @param {object} question 
     * @returns {integer}
     */
    getAnswer(question) {
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
    
    /**
     * Return a random element from the given array
     * @param {array} arr 
     * @returns {*}
     */
    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    startTimer() {
        if (!this.intervalId) {        
            this.timer = 0;
            document.querySelector('.js-timer').textContent = this.timer;
        }
    
        this.intervalId = window.setInterval(() => {
            this.timer++;
            document.querySelector('.js-timer').textContent = this.timer;
        }, 1000);
    }
    
    stopTimer() {
        window.clearInterval(this.intervalId);
        this.intervalId = false;
    }
    
    handleEvaluation(e) {
        const answer = e.target.getAttribute('data-your-answer');
        if (answer === 'right') {
            this.score.correct++;
            document.querySelector('.js-correct-score').textContent = this.score.correct;
        } else {
            this.score.incorrect++;
            document.querySelector('.js-incorrect-score').textContent = this.score.incorrect;
        }
    
        document.querySelector('.js-right-wrong').style.display = 'none';
        this.newQuestion();
    }
    
    updateAverageTimeToAnswer() {
        this.answerTimes.push(parseInt(document.querySelector('.js-timer').textContent));
        const totalAnswerTime = this.answerTimes.reduce((accumulator, answerTime) => {
            return accumulator + answerTime;
        }, 0);
        const averageTimeToAnswer = Math.round(totalAnswerTime / this.answerTimes.length);
        document.querySelector('.js-average-time').textContent = averageTimeToAnswer;
    }
    
    updateAnswerHelp(question) {
        if (
            !(question.type === 'multiplication' &&
            parseInt(question.firstNumDigits) === 2 && parseInt(question.secondNumDigits) === 2)
        ) {
            return;
        }
    
        let answerHelp = '';
    
        // Determine the easiest method
        if (question.first === question.second) {
            answerHelp = this.getSquareHelpText(question);
        } else if (question.first === 11 || question.second === 11) {
            answerHelp = this.getMultiplicationByElevenHelpText(question);
        } else if (this.canUseEvensAddToTen(question)) {
            answerHelp = this.getMatchingFirstDigitsAndSecondDigitsAddToTen(question);
        } else if (this.getDigit(question.first, 1) > 7 && this.getDigit(question.second, 1) > 7) {
            answerHelp = this.getMultiplicationSubtractionMethodHelpText(question);
        } else {
            if (this.shouldUseSubtractionMethod(question)) {
                answerHelp = this.getMultiplicationSubtractionMethodHelpText(question);
            } else {
                answerHelp = this.getMultiplicationAdditionMethodHelpTextWithLabel(question);
            }
        }
    
        document.querySelector('.js-answer-help').innerText = answerHelp;
    }
    
    shouldUseSubtractionMethod(question) {
        let shouldUseSubtractionMethod = false;
    
        const isFirstNumberEightOrNine = this.getDigit(question.first, 1) === 8 || this.getDigit(question.first, 1) === 9;
        const isSecondNumberEightOrNine = this.getDigit(question.second, 1) === 8 || this.getDigit(question.second, 1) === 9;
    
        if (!isFirstNumberEightOrNine && !isSecondNumberEightOrNine) {
            return shouldUseSubtractionMethod;
        }
    
        const firstDistanceToTen = this.getDistanceToNearestTen(this.getDigit(question.first, 1));
        const secondDistanceToTen = this.getDistanceToNearestTen(this.getDigit(question.second, 1));
        const areBothNumbersLessThanSix = this.getDigit(question.first, 1) < 6 && this.getDigit(question.second, 1) < 6;
    
        if ((firstDistanceToTen > 2 && secondDistanceToTen > 2) || areBothNumbersLessThanSix) {
            return shouldUseSubtractionMethod;
        }
    
        const isEitherNumberLessThanSix = this.getDigit(question.first, 1) <= 5 || this.getDigit(question.second, 1) <= 5;
    
        if (firstDistanceToTen === secondDistanceToTen && isEitherNumberLessThanSix) {
            return shouldUseSubtractionMethod;
        }
    
        const areBothNumbersGreaterThanFive = this.getDigit(question.first, 1) > 5 && this.getDigit(question.second, 1) > 5;
    
        if (areBothNumbersGreaterThanFive) {
            shouldUseSubtractionMethod = true;
        } else {
            const smallestDistanceToTenKey = secondDistanceToTen > firstDistanceToTen ? 'first' : 'second';
            const furthestDistanceKey = smallestDistanceToTenKey === 'first' ? 'second' : 'first';
    
            if (this.getDigit(question[smallestDistanceToTenKey], 1) <= 5) {
                return shouldUseSubtractionMethod;
            }
    
            let distanceThreshold;
    
            if (this.getDigit(question[smallestDistanceToTenKey], 1) === 9) {
                distanceThreshold = 2;
            } else {
                // smallest must be an 8 (i.e. 2 from 10) if we get here
                distanceThreshold = 3;
            }
    
            if (this.getDigit(question[furthestDistanceKey], 1) > distanceThreshold) {
                shouldUseSubtractionMethod = true;
            }
        }
    
        return shouldUseSubtractionMethod;
    }
    
    canUseEvensAddToTen(question) {
        let canUse = false;
    
        if (this.getDigit(question.first, 0) === this.getDigit(question.second, 0) &&
            this.getDigit(question.first, 1) + this.getDigit(question.second, 1) === 10
        ) {
            canUse = true;
        }
    
        return canUse;
    }
    
    getDistanceToNearestTen(n) {
        let distanceToTen;
    
        if (n > 5) {
            distanceToTen = 10 % n;
        } else {
            distanceToTen = n % 10;
        }
    
        return distanceToTen;
    }
    
    getSquareHelpText(question) {
        const shouldRoundUp = this.getDigit(question.first, 1) > 5;
        const distanceToTen = this.getDigit(question.first, 1) % 10 > 5 ? 10 - (this.getDigit(question.first, 1) % 10) : this.getDigit(question.first, 1) % 10;
        const leftMultiplier = shouldRoundUp ? ((this.getDigit(question.first, 0)) + 1) * 10: this.getDigit(question.first, 0) * 10;
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
    
    getMultiplicationByElevenHelpText(question) {
        const additionNumberKey = question.first === 11 ? 'second' : 'first';
        const firstDigit = this.getDigit(question[additionNumberKey], 0);
        const secondDigit = this.getDigit(question[additionNumberKey], 1);
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
    
    getMatchingFirstDigitsAndSecondDigitsAddToTen(question) {
        const firstPart = ((this.getDigit(question.first, 0) * 10) * (this.getDigit(question.first, 0) + 1) * 10);
        const secondPart = this.getDigit(question.first, 1) * this.getDigit(question.second, 1);
        const answerHelp = `Method: Matching first digits and second digits add up to 10 trick
        ${this.getDigit(question.first, 0) * 10} * ${(this.getDigit(question.first, 0) + 1) * 10} = ${firstPart}
        ${this.getDigit(question.first, 1)} * ${this.getDigit(question.second, 1)} = ${secondPart}
        ${firstPart} + ${secondPart} = ${firstPart + secondPart}`;
    
        return answerHelp;
    }
    
    getMultiplicationSubtractionMethodHelpText(question) {
        let answerHelp = `Method: subtraction`;
    
        const subtractionQuestion = this.getSubtractionMethodQuestion(question);
        answerHelp += this.getMultiplicationAdditionMethodHelpText(subtractionQuestion);
    
        // Add the subtraction part
        const keyOfNumberToRoundUp = this.getClosestSecondDigitToTen(question);
        const multiplicationToSubtract = 10 - (this.getDigit(question[keyOfNumberToRoundUp], 1) % 10);
        const keyOfNumberToSubtract = keyOfNumberToRoundUp === 'first' ? 'second' : 'first';
        const amountToSubtract = multiplicationToSubtract * question[keyOfNumberToSubtract];
        const amountToSubtractQuestionText = multiplicationToSubtract > 1 ? `${multiplicationToSubtract} * ${subtractionQuestion.second} = ` : '';
        const subtractionQuestionAnswer = this.getAnswer(subtractionQuestion);
        const finalAnswer = subtractionQuestionAnswer - amountToSubtract;
        answerHelp += `\nAmount to subtract: ${amountToSubtractQuestionText} ${amountToSubtract}
        Answer: ${subtractionQuestionAnswer} - ${amountToSubtract} = ${finalAnswer}`;
    
        return answerHelp;
    }
    
    getSubtractionMethodQuestion(question) {
        const keyOfNumberToRoundUp = this.getClosestSecondDigitToTen(question);
        const firstRoundedUp = question[keyOfNumberToRoundUp] + (10 - question[keyOfNumberToRoundUp] % 10);
    
        const subtractionQuestion = {
            type: 'multiplication',
            first: firstRoundedUp,
            second: keyOfNumberToRoundUp === 'first' ? question.second : question.first,
        };
    
        return subtractionQuestion;
    }
    
    getClosestSecondDigitToTen(question) {
        let closestSecondDigitToTen;
    
        const firstSecondDigitDistanceToTen = this.getDistanceToNearestTen(this.getDigit(question.first, 1));
        const secondSecondDigitDistanceToTen = this.getDistanceToNearestTen(this.getDigit(question.second, 1));
    
        if (firstSecondDigitDistanceToTen === secondSecondDigitDistanceToTen) {
            // use whichever has largest first digit to make the addition easier
            closestSecondDigitToTen = this.getDigit(question.second, 0) > this.getDigit(question.first, 0) ? 'second' : 'first';
        } else {
            closestSecondDigitToTen = (firstSecondDigitDistanceToTen < secondSecondDigitDistanceToTen) ? 'first' : 'second';
        }
    
        return closestSecondDigitToTen;
    }
    
    getMultiplicationAdditionMethodHelpTextWithLabel(question) {
        let answerHelp = 'Answer method: addition';
        answerHelp += this.getMultiplicationAdditionMethodHelpText(question);
    
        return answerHelp;
    }
    
    getMultiplicationAdditionMethodHelpText(question) {
        const closestSecondDigitToTen = this.getClosestSecondDigitToTen(question);
        
        let leftMultiplier, rightMultiplier;
        if (closestSecondDigitToTen === 'first') {
            leftMultiplier = question.first;
            rightMultiplier = question.second;
        } else {
            leftMultiplier = question.second;
            rightMultiplier = question.first;
        }
    
        const leftFirstDigitMultiplier = leftMultiplier === 100 ? 100 : this.getDigit(leftMultiplier, 0) * 10;
        const leftSecondDigit = this.getDigit(leftMultiplier, 1);
        const rightFirstDigitMultiplier = this.getDigit(rightMultiplier, 0) * 10;
        const rightSecondDigit = this.getDigit(rightMultiplier, 1);
    
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
    getDigit(number, digit) {
        return parseInt(number.toString()[digit]);
    }    
}

const main = new Main;
main.startGame();