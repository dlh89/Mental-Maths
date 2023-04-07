export class Results
{
    // TODO convert results to class property

    parseResults(results) {
        this.getAnswersByTypeBreakdown(results);
    }

    getAnswersByTypeBreakdown(results) {
        const questionTypes = this.getQuestionTypes(results);
        console.log('questionTypes:', questionTypes);
        // TODO get correct/incorrect for each question type
    }

    getQuestionTypes(results) {
        const answerTypes = [];
        for (const result of results.correct.concat(results.incorrect)) {
            const questionType = {
                type: result.type,
                firstNumDigits: result.firstNumDigits,
                secondNumDigits: result.secondNumDigits,
            };

            if (!answerTypes.some(answerType => JSON.stringify(answerType) === JSON.stringify(questionType))) {
                answerTypes.push(questionType);
            }
        }

        return answerTypes;
    }
}