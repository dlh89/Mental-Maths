import { Utils } from './Utils.js';

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
    
        const subtractionQuestion = this.getSubtractionMethodQuestion(question);
        answerHelp += this.getMultiplicationAdditionMethodHelpText(subtractionQuestion);
    
        // Add the subtraction part
        const keyOfNumberToRoundUp = this.getClosestSecondDigitToTen(question);
        const multiplicationToSubtract = 10 - (this.utils.getDigit(question[keyOfNumberToRoundUp], 1) % 10);
        const keyOfNumberToSubtract = keyOfNumberToRoundUp === 'first' ? 'second' : 'first';
        const amountToSubtract = multiplicationToSubtract * question[keyOfNumberToSubtract];
        const amountToSubtractQuestionText = multiplicationToSubtract > 1 ? `${multiplicationToSubtract} * ${subtractionQuestion.second} = ` : '';
        const subtractionQuestionAnswer = this.utils.getAnswer(subtractionQuestion);
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
    
        const leftFirstDigitMultiplier = leftMultiplier === 100 ? 100 : this.utils.getDigit(leftMultiplier, 0) * 10;
        const leftSecondDigit = this.utils.getDigit(leftMultiplier, 1);
        const rightFirstDigitMultiplier = this.utils.getDigit(rightMultiplier, 0) * 10;
        const rightSecondDigit = this.utils.getDigit(rightMultiplier, 1);
    
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
}