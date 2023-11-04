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
        const parsedResults = this.getCombinedParsedResults(results);

        let answersByTypeString = '';

        for (const result in parsedResults) {
            answersByTypeString += `<h3>${result}</h3>`;
            let correctAnswerCount = 0;
            for (const question of parsedResults[result]) {
                if (question.correct) {
                    correctAnswerCount++;
                }
            }

            const percentageString = this.utils.getPercentageString(correctAnswerCount, parsedResults[result].length);
            answersByTypeString += `\n<p>${correctAnswerCount} / ${parsedResults[result].length} (${percentageString})</p>`;
        }
        
        return answersByTypeString;
    }

    getCombinedParsedResults(results) {
        const parsedResults = {};
        for (const result of results.correct.concat(results.incorrect)) {
            const question = {
                type: result.type,
                firstNumDigits: result.firstNumDigits,
                secondNumDigits: result.secondNumDigits,
                correct: this.utils.isInArray(results.correct, result),
            };

            const fullAnswerTypeString = this.getFullAnswerTypeString(question);

            if (!parsedResults.hasOwnProperty(fullAnswerTypeString)) {
                parsedResults[fullAnswerTypeString] = [];
            }

            parsedResults[fullAnswerTypeString].push(question);
        }

        return parsedResults;
    }

    getFullAnswerTypeString(question) {
        const fullAnswerTypeString = `${question.firstNumDigits} by ${question.secondNumDigits} ${question.type}`;

        return fullAnswerTypeString;
    }

    getOverallAnswersString(results) {
        const totalCorrectAnswers = results.correct.length;
        const totalQuestionCount = results.correct.concat(results.incorrect).length;
        const percentageString = this.utils.getPercentageString(totalCorrectAnswers, totalQuestionCount);
        const overallAnswersString = `<h3>Overall</h3>
        <p>${totalCorrectAnswers} / ${totalQuestionCount} (${percentageString})</p>`;

        return overallAnswersString;
    }
}