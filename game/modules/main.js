import { Multiplication } from './Multiplication.js';
import { Results } from './Results.js';
import { Utils } from './Utils.js';

export class Main
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
    
        this.questionTypes = questionTypes;
        this.multiplicationDigits = multiplicationDigits;
        this.additionDigits = additionDigits;
        this.subtractionDigits = subtractionDigits;
        this.includeSubtractionNegatives = includeSubtractionNegatives;
        
        this.score = {
            correct: [],
            incorrect: [],
        };

        this.timer = false;
        this.intervalId = false;
        this.answerTimes = [];
        this.question = {};
        this.type;
        this.repeatIncorrectQuestions = true;
        this.questionRepeatGap = 1;
        this.questionsSinceRepeat = 0;
        this.queue = [];

        this.validateQuestionTypes(questionTypes);

        this.utils = new Utils();
        this.multiplication = new Multiplication();
        this.results = new Results();
    }

    validateQuestionTypes() {
        this.questionTypes.forEach((questionType) => {
            if (!Main.arithmeticTypes.includes(questionType)) {
                console.error('Question type doesn\'t exist.');
            }
        });

    }

    startGame() {
        document.querySelector('.js-show-answer').addEventListener('click', this.renderAnswer.bind(this));
        const yourAnswer = document.querySelectorAll('.js-your-answer');

        yourAnswer.forEach(answerBtn => {
            answerBtn.addEventListener('click', (e) => this.handleEvaluation.call(this, e));
        });

        document.querySelector('.js-end-session').addEventListener('click', this.handleEndSession.bind(this));
    
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.queue.length) {
            if (this.questionsSinceRepeat >= this.questionRepeatGap) {
                this.question = this.queue.shift();
                if (!this.queue.length) {
                    this.questionsSinceRepeat = 0;
                }
            } else {
                this.questionsSinceRepeat++;
                this.getNewQuestion();
            }
        } else {
            this.getNewQuestion();
        }

        this.renderQuestion(this.question);
        this.startTimer();
    }
    
    getNewQuestion() {
        this.type = this.utils.getRandomElement(this.questionTypes);
        const arithmeticTypeDigits = this.getArithmeticTypeDigits();
        const numDigits = this.utils.getRandomElement(arithmeticTypeDigits);
        const digitsArr = this.utils.getDigitsArr(numDigits);
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
    
    renderQuestion(question) {
        const symbol = this.utils.getSymbol(question.type);
        const questionText = `${question.first} ${symbol} ${question.second}`;
    
        document.querySelector('.js-answer-help').textContent = '';
        document.querySelector('.js-question').textContent = questionText;
        document.querySelector('.js-show-answer').style.display = 'block';
        document.querySelector('.js-answer-text').style.display = 'none';
    }
    
    renderAnswer() {
        this.stopTimer();
        const answer = this.utils.getAnswer(this.question);
        document.querySelector('.js-show-answer').style.display = 'none';
        document.querySelector('.js-answer-text').style.display = 'inline-block';
        document.querySelector('.js-answer-text').textContent = answer;
    
        document.querySelector('.js-right-wrong').style.display = 'block';
    
        this.updateAnswerHelp(this.question);
        this.updateAverageTimeToAnswer();
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
        this.maybeUnhideEndSessionBtn();
        const answer = e.target.getAttribute('data-your-answer');
        if (answer === 'right') {
            this.score.correct.push(this.question);
            document.querySelector('.js-correct-score').textContent = this.score.correct.length;
        } else {
            this.score.incorrect.push(this.question);
            document.querySelector('.js-incorrect-score').textContent = this.score.incorrect.length;

            if (this.repeatIncorrectQuestions) {
                this.queue.push(this.question);
            }
        }
    
        document.querySelector('.js-right-wrong').style.display = 'none';
        this.nextQuestion();
    }

    /**
     * Show the end session button if it is hidden
     */
    maybeUnhideEndSessionBtn() {
        const endSessionBtn = document.querySelector('.js-end-session');
        if (!endSessionBtn.classList.contains('end-session-btn--active')) {
            endSessionBtn.classList.add('end-session-btn--active');
        }
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
        let answerHelp = '';

        if (question.type === 'multiplication') {
            answerHelp = this.multiplication.getAnswerHelp(question);
        }
    
        document.querySelector('.js-answer-help').innerText = answerHelp;
    }

    handleEndSession() {
        if (!this.score.correct.length && !this.score.incorrect.length) {
            return; // No questions have been answered yet
        }

        const shouldEndSession = confirm('Are you sure you want to end the session?');
        if (!shouldEndSession) {
            return;
        }
        this.results.renderResults(this.score);
    }
}

const main = new Main();
main.startGame();