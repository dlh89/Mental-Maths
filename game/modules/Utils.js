export class Utils
{
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
}