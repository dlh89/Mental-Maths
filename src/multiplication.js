import { Utils } from './utils.js';

export class Multiplication
{
    constructor() {
        this.utils = new Utils();
    }

    getAnswerHelp(question) {
        let answerHelp = '';

        if (!(parseInt(question.firstNumDigits) === 2 && parseInt(question.secondNumDigits) === 2)) {
            return answerHelp;
        }
    
        // Determine the easiest method
        if (question.first === question.second) {
            answerHelp = this.getSquareHelpText(question);
        } else if (question.first === 11 || question.second === 11) {
            answerHelp = this.getMultiplicationByElevenHelpText(question);
        } else if (this.canUseEvensAddToTen(question)) {
            answerHelp = this.getMatchingFirstDigitsAndSecondDigitsAddToTen(question);
        } else if (this.utils.getDigit(question.first, 1) > 7 && this.utils.getDigit(question.second, 1) > 7) {
            answerHelp = this.getMultiplicationSubtractionMethodHelpText(question);
        } else {
            if (this.shouldUseSubtractionMethod(question)) {
                answerHelp = this.getMultiplicationSubtractionMethodHelpText(question);
            } else {
                answerHelp = this.getMultiplicationAdditionMethodHelpTextWithLabel(question);
            }
        }

        return answerHelp;
    }

    shouldUseSubtractionMethod(question) {
        let shouldUseSubtractionMethod = false;
    
        const isFirstNumberEightOrNine = this.utils.getDigit(question.first, 1) === 8 || this.utils.getDigit(question.first, 1) === 9;
        const isSecondNumberEightOrNine = this.utils.getDigit(question.second, 1) === 8 || this.utils.getDigit(question.second, 1) === 9;
    
        if (!isFirstNumberEightOrNine && !isSecondNumberEightOrNine) {
            return shouldUseSubtractionMethod;
        }
    
        const firstDistanceToTen = this.utils.getDistanceToNearestTen(this.utils.getDigit(question.first, 1));
        const secondDistanceToTen = this.utils.getDistanceToNearestTen(this.utils.getDigit(question.second, 1));
        const areBothNumbersLessThanSix = this.utils.getDigit(question.first, 1) < 6 && this.utils.getDigit(question.second, 1) < 6;
    
        if ((firstDistanceToTen > 2 && secondDistanceToTen > 2) || areBothNumbersLessThanSix) {
            return shouldUseSubtractionMethod;
        }
    
        const isEitherNumberLessThanSix = this.utils.getDigit(question.first, 1) <= 5 || this.utils.getDigit(question.second, 1) <= 5;
    
        if (firstDistanceToTen === secondDistanceToTen && isEitherNumberLessThanSix) {
            return shouldUseSubtractionMethod;
        }
    
        const areBothNumbersGreaterThanFive = this.utils.getDigit(question.first, 1) > 5 && this.utils.getDigit(question.second, 1) > 5;
    
        if (areBothNumbersGreaterThanFive) {
            shouldUseSubtractionMethod = true;
        } else {
            const smallestDistanceToTenKey = secondDistanceToTen > firstDistanceToTen ? 'first' : 'second';
            const furthestDistanceKey = smallestDistanceToTenKey === 'first' ? 'second' : 'first';
    
            if (this.utils.getDigit(question[smallestDistanceToTenKey], 1) <= 5) {
                return shouldUseSubtractionMethod;
            }
    
            let distanceThreshold;
    
            if (this.utils.getDigit(question[smallestDistanceToTenKey], 1) === 9) {
                distanceThreshold = 2;
            } else {
                // smallest must be an 8 (i.e. 2 from 10) if we get here
                distanceThreshold = 3;
            }
    
            if (this.utils.getDigit(question[furthestDistanceKey], 1) > distanceThreshold) {
                shouldUseSubtractionMethod = true;
            }
        }
    
        return shouldUseSubtractionMethod;
    }
    
    canUseEvensAddToTen(question) {
        let canUse = false;
    
        if (this.utils.getDigit(question.first, 0) === this.utils.getDigit(question.second, 0) &&
            this.utils.getDigit(question.first, 1) + this.utils.getDigit(question.second, 1) === 10
        ) {
            canUse = true;
        }
    
        return canUse;
    }

    getSquareHelpText(question) {
        const shouldRoundUp = this.utils.getDigit(question.first, 1) > 5;
        const distanceToTen = this.utils.getDigit(question.first, 1) % 10 > 5 ? 10 - (this.utils.getDigit(question.first, 1) % 10) : this.utils.getDigit(question.first, 1) % 10;
        const leftMultiplier = shouldRoundUp ? ((this.utils.getDigit(question.first, 0)) + 1) * 10: this.utils.getDigit(question.first, 0) * 10;
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
        const firstDigit = this.utils.getDigit(question[additionNumberKey], 0);
        const secondDigit = this.utils.getDigit(question[additionNumberKey], 1);
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
        const firstPart = ((this.utils.getDigit(question.first, 0) * 10) * (this.utils.getDigit(question.first, 0) + 1) * 10);
        const secondPart = this.utils.getDigit(question.first, 1) * this.utils.getDigit(question.second, 1);
        const answerHelp = `Method: Matching first digits and second digits add up to 10 trick
        ${this.utils.getDigit(question.first, 0) * 10} * ${(this.utils.getDigit(question.first, 0) + 1) * 10} = ${firstPart}
        ${this.utils.getDigit(question.first, 1)} * ${this.utils.getDigit(question.second, 1)} = ${secondPart}
        ${firstPart} + ${secondPart} = ${firstPart + secondPart}`;
    
        return answerHelp;
    }
    
    getMultiplicationSubtractionMethodHelpText(question) {
        let answerHelp = `Method: subtraction`;

        question = this.maybeReorderSubtractionQuestion(question);
    
        const roundedUpQuestion = this.getRoundedUpQuestion(question);
        answerHelp += this.getMultiplicationAdditionMethodHelpText(roundedUpQuestion);
    
        // Add the subtraction part
        const amountToSubtractQuestion = this.getAmountToSubtractQuestion(question);
        const subtractionQuestion = this.getSubtractionQuestion(this.utils.getAnswer(roundedUpQuestion), this.utils.getAnswer(amountToSubtractQuestion));

        answerHelp += this.utils.buildHelpText([amountToSubtractQuestion, subtractionQuestion]);
    
        return answerHelp;
    }

    maybeReorderSubtractionQuestion(question) {
        let isSwapRequired = false;

        if (this.utils.getDigit(question.first, 1) === this.utils.getDigit(question.second, 1)) {
            // use whichever has largest first digit to make the subsequent subtraction easier
            isSwapRequired = this.utils.getDigit(question.second, 0) > this.utils.getDigit(question.first, 0) ? true : false;
        } else if (this.utils.getDigit(question.first, 1) < this.utils.getDigit(question.second, 1)) {
            isSwapRequired = true;
        }

        if (isSwapRequired) {
            question = this.utils.swapQuestion(question);
        }

        return question;
    }
    
    getRoundedUpQuestion(question) {
        const roundedUpQuestion = {...question};
        const firstRoundedUp = question.first + (10 - question.first % 10);
        roundedUpQuestion.first = firstRoundedUp;
    
        return roundedUpQuestion;
    }

    getAmountToSubtractQuestion(question) {
        const amountToSubtractQuestion = {...question};
        amountToSubtractQuestion.first = 10 - this.utils.getDigit(question.first, 1);
        amountToSubtractQuestion.firstNumDigits = 1;

        return amountToSubtractQuestion;
    }

    getSubtractionQuestion(first, second) {
        const subtractionQuestion = {
            first,
            second,
            type: 'subtraction',
        };

        return subtractionQuestion;
    }
    
    getClosestSecondDigitToTen(question) {
        let closestSecondDigitToTen;
    
        const firstSecondDigitDistanceToTen = this.utils.getDistanceToNearestTen(this.utils.getDigit(question.first, 1));
        const secondSecondDigitDistanceToTen = this.utils.getDistanceToNearestTen(this.utils.getDigit(question.second, 1));
    
        if (firstSecondDigitDistanceToTen === secondSecondDigitDistanceToTen) {
            // use whichever has largest first digit to make the addition easier
            closestSecondDigitToTen = this.utils.getDigit(question.second, 0) > this.utils.getDigit(question.first, 0) ? 'second' : 'first';
        } else {
            closestSecondDigitToTen = (firstSecondDigitDistanceToTen < secondSecondDigitDistanceToTen) ? 'first' : 'second';
        }
    
        return closestSecondDigitToTen;
    }

    maybeReOrderAdditionQuestion(question) {
        let isSwapRequired = false;

        if (this.utils.getDigit(question.first, 1) === this.utils.getDigit(question.second, 1)) {
            // use whichever has largest first digit to make the subsequent addition easier
            isSwapRequired = this.utils.getDigit(question.second, 0) > this.utils.getDigit(question.first, 0) ? true : false;
        } else if (this.utils.getDigit(question.first, 1) > this.utils.getDigit(question.second, 1)) {
            isSwapRequired = true;   
        }

        if (isSwapRequired) {
            question = this.utils.swapQuestion(question);
        }

        return question;
    }
    
    getMultiplicationAdditionMethodHelpTextWithLabel(question) {
        let answerHelp = 'Answer method: addition';
        answerHelp += this.getMultiplicationAdditionMethodHelpText(question);
    
        return answerHelp;
    }

    getMultiplicationAdditionMethodHelpText(question) {
        const reOrderedQuestion = this.maybeReOrderAdditionQuestion(question);
        const roundedDownQuestion = this.getRoundedDownQuestion(reOrderedQuestion);
        const SecondDigitMultiplicationQuestion = this.getSecondDigitMultiplicationQuestion(reOrderedQuestion);
        const additionQuestion = this.getAdditionQuestion(this.utils.getAnswer(roundedDownQuestion), this.utils.getAnswer(SecondDigitMultiplicationQuestion));

        const helpText = this.utils.buildHelpText([
            roundedDownQuestion,
            SecondDigitMultiplicationQuestion,
            additionQuestion,
        ]);

        return helpText;
    }

    /**
     * Round down the second digit of the first operand of the question, e.g. 74 x 66 becomes 70 x 66
     * @param {object} 
     * @returns {object}
     */
    getRoundedDownQuestion({first, ...rest}) {
        const firstRoundedDown = this.utils.getDigit(first, 0) * 10;

        return {first: firstRoundedDown, ...rest};
    }
    
    /**
     * Round the second digit question for a multiplication question, e.g. 74 x 66 becomes 4 x 66
     * @param {object} 
     * @returns {object}
     */
    getSecondDigitMultiplicationQuestion({first, ...rest}) {
        const firstSecondDigit = this.utils.getDigit(first, 1); // Just the second digit of the first operand

        return {first: firstSecondDigit, ...rest};
    }

    /**
     * Get an addition question object from the first and second numbers provided
     * @param {integer} first 
     * @param {integer} second 
     * @returns {object}
     */
    getAdditionQuestion(first, second) {
        const additionQuestion = {
            'first': first,
            'second': second,
            'type': 'addition',
        };

        return additionQuestion;
    }
}