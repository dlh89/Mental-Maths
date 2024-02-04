import { Utils } from './utils.js';

export class Results
{
    constructor() {
        this.utils = new Utils();
    }

    renderResults(results) {
        const numberOfQuestionVariations = this.getNumberOfQuestionVariations();

        if (numberOfQuestionVariations > 1) {
            const answersByTypeString = this.getAnswersByTypeString(results);
            document.querySelector('.js-results-by-type').innerHTML = answersByTypeString;
        }

        const overallAnswersString = this.getOverallAnswersString(results);
        document.querySelector('.js-results-overall').innerHTML = overallAnswersString;

        document.querySelector('.js-average-time-to-answer').innerText = document.querySelector('.js-average-time').textContent + ' seconds';

        const sessionLength = Math.abs(results.endTime - results.startTime);

        document.querySelector('.js-session-length').innerText = this.utils.getFormattedMilliseconds(sessionLength);

        document.querySelector('.js-game').style.display = 'none';
        document.querySelector('.js-results').style.display = 'block';
    }

    getNumberOfQuestionVariations() {
        const parsedUrl = new URL(window.location.href);
        const multiplicationDigits = parsedUrl.searchParams.getAll('multiplication_digits');
        const additionDigits = parsedUrl.searchParams.getAll('addition_digits');
        const subtractionDigits = parsedUrl.searchParams.getAll('subtraction_digits');

        const allQuestionVariationCounts = [
            multiplicationDigits.length,
            additionDigits.length,
            subtractionDigits.length,
        ];

        const numberOfQuestionVariations = allQuestionVariationCounts.reduce((accumulator, questionType) => accumulator + questionType, 0);
        
        return numberOfQuestionVariations;
    }

    getAnswersByTypeString(results) {
        const answersByType = this.getResultsByQuestionType(results);

        let answersByTypeString = '';

        for (const type in answersByType) {
            answersByTypeString += `<h3>${this.firstCharToUpper(type)}</h3>`;
            for (const numDigits in answersByType[type]) {
                answersByTypeString += `<h4>${numDigits}</h4>`;
                let correctAnswerCount = 0;
                for (const question of answersByType[type][numDigits]) {
                    if (question.isCorrect) {
                        correctAnswerCount++;
                    }
                }

                const percentageString = this.utils.getPercentageString(correctAnswerCount, answersByType[type][numDigits].length);
                answersByTypeString += `\n<p>${correctAnswerCount} / ${answersByType[type][numDigits].length} (${percentageString})</p>`;
            }
        }
        
        return answersByTypeString;
    }

    firstCharToUpper(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    getResultsByQuestionType(results) {
        let resultsByQuestionType = {};
        results.answers.forEach((answer) => {
            answer.date = new Date(results.startTime).toLocaleDateString('en-GB'); // TODO not necessary here but needed in charts
            resultsByQuestionType = this.addPropertyIfNotExists(resultsByQuestionType, answer.type, 'obj');
            answer.numDigits = `${answer.firstNumDigits}x${answer.secondNumDigits}`;
            resultsByQuestionType[answer.type] = this.addPropertyIfNotExists(resultsByQuestionType[answer.type], answer.numDigits);
            resultsByQuestionType[answer.type][answer.numDigits].push(answer);
        });

        return resultsByQuestionType;
    }

    addPropertyIfNotExists(obj, prop, addType = 'arr') {
        if (!obj.hasOwnProperty(prop)) {
            switch (addType) {
                case 'arr':
                    obj[prop] = [];
                    break;
                case 'obj':
                    obj[prop] = {};
                    break;
            
                default:
                    obj[prop] = false;
                    break;
            }
        }

        return obj;
    }

    getFullAnswerTypeString(question) {
        const fullAnswerTypeString = `${question.firstNumDigits} by ${question.secondNumDigits} ${question.type}`;

        return fullAnswerTypeString;
    }

    getOverallAnswersString(results) {
        const totalCorrectAnswers = results.answers.reduce((accumulator, answer) => {
            if (answer.isCorrect) {
                accumulator++;
            }
            return accumulator;
        }, 0);
        const totalQuestionCount = results.answers.length;
        const percentageString = this.utils.getPercentageString(totalCorrectAnswers, totalQuestionCount);
        const overallAnswersString = `<h3>Overall</h3>
        <p>${totalCorrectAnswers} / ${totalQuestionCount} (${percentageString})</p>`;

        return overallAnswersString;
    }
}