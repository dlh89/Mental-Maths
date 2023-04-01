export class Utils
{
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

    /**
     * Return a random element from the given array
     * @param {array} arr 
     * @returns {*}
     */
    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Translate string into array of two integers
     * @param {string} numDigits 
     */
    getDigitsArr(numDigits) {
        return numDigits.split('x');
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

    getDistanceToNearestTen(n) {
        let distanceToTen;
    
        if (n > 5) {
            distanceToTen = 10 % n;
        } else {
            distanceToTen = n % 10;
        }
    
        return distanceToTen;
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

    swapQuestion(question) {
        const tempSecond = question.second;
        question.second = question.first;
        question.first = tempSecond;

        return question;
    }

     /**
     * Return a string of the question and answer, e.g. "70 x 66 = 4620"
     * @param {object} question 
     * @returns {string}
     */
     getQuestionAndAnswerText(question) {
        const answer = this.getAnswer(question);

        return `${question.first} ${this.getSymbol(question.type)} ${question.second} = ${answer}`;
    }

    /**
     * Build a string of text with a line for each question and answer, skipping questions where operands are 0 or 1
     * @param {array} questions 
     * @returns {string}
     */
    buildHelpText(questions) {
        let helpText = '';
        const skipOperands = [0, 1];

        for (const question of questions) {
            if (skipOperands.includes(question.first) || skipOperands.includes(question.second)) {
                continue;
            }

            helpText += '\n' + this.getQuestionAndAnswerText(question);
        }

        return helpText;
    }
}