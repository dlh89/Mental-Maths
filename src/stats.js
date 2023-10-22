import firebaseService from './firebase-service.js';

export class Stats
{
    constructor() {
        const statsContainer = document.querySelector('.js-stats-container');
        if (!statsContainer) {
            return;
        }

        firebaseService.auth.onAuthStateChanged((user) => {
            if (user) {
              this.userId = firebaseService.auth.currentUser.uid;
            }

            this.populateStats();
        });
    }

    async populateStats() {
        const playerStats = await firebaseService.getStats(this.userId);
        this.populateGlobalStats(playerStats);
        const resultsTbody = document.querySelector('.js-results-tbody');
        const resultsRow = document.querySelector('.js-results-row');
        let totalCorrectAnswers = 0;
        let totalIncorrectAnswers = 0;
        let totalTimeToAnswer = 0;
        let totalTimePlayed = 0;
        let totalQuestionsAnswered = 0;

        playerStats.forEach((result) => {
            const resultData = result.data();
            const sessionQuestionsAnswered = resultData.correct.length + resultData.incorrect.length;
            totalQuestionsAnswered += sessionQuestionsAnswered;
            totalCorrectAnswers += resultData.correct.length;
            totalIncorrectAnswers += resultData.incorrect.length;
            const sessionLength = Math.abs(resultData.endTime - resultData.startTime);
            totalTimePlayed += sessionLength;
            const correctPercentageString = Math.round(resultData.correct.length / (resultData.correct.length + resultData.incorrect.length) * 100) + '%';
            const sessionTotalTimeToAnswer = this.getTotalTimeToAnswer(resultData);
            totalTimeToAnswer += sessionTotalTimeToAnswer;

            const resultsRowClone = resultsRow.cloneNode(true);
            const resultsDate = resultsRowClone.querySelector('.js-results-date');
            const resultsStartTime = resultsRowClone.querySelector('.js-results-start-time');
            const resultsEndTime = resultsRowClone.querySelector('.js-results-end-time');
            const resultsScore = resultsRowClone.querySelector('.js-results-score');
            const resultsPercentage = resultsRowClone.querySelector('.js-results-percentage');
            const sessionLengthElem = resultsRowClone.querySelector('.js-session-length');
            const averageTimeToAnswerElem = resultsRowClone.querySelector('.js-average-time-to-answer');
            const startTime = resultData?.startTime;
            const endTime = resultData?.endTime;
            resultsDate.textContent = startTime ? new Date(startTime).toLocaleDateString('en-GB') : '';
            resultsStartTime.textContent = startTime ? new Date(startTime).toLocaleTimeString() : '';
            resultsEndTime.textContent = endTime ? new Date(endTime).toLocaleTimeString() : '';
            resultsScore.textContent = `${resultData.correct.length} / ${resultData.correct.length + resultData.incorrect.length}`;
            resultsPercentage.textContent = correctPercentageString;
            sessionLengthElem.textContent = this.getFormattedMilliseconds(sessionLength);
            averageTimeToAnswerElem.textContent = this.getFormattedMilliseconds((sessionTotalTimeToAnswer / sessionQuestionsAnswered) * 1000);

            resultsTbody.appendChild(resultsRowClone);
        });

        const overallCorrectPercentageElem = document.querySelector('.js-overall-correct-percentage');
        overallCorrectPercentageElem.textContent = Math.round((totalCorrectAnswers / (totalCorrectAnswers + totalIncorrectAnswers)) * 100) + '%';
        const totalTimePlayedElem = document.querySelector('.js-total-time-played');
        totalTimePlayedElem.textContent = this.getFormattedMilliseconds(totalTimePlayed);
        const averageTimeToAnswer = document.querySelector('.js-average-time-to-answer');
        averageTimeToAnswer.textContent = this.getFormattedMilliseconds((totalTimeToAnswer / totalQuestionsAnswered) * 1000);

        resultsRow.style.display = 'none';
    }

    populateGlobalStats(playerStats) {
    }

    getFormattedMilliseconds(timeInMilliseconds) {
        const hours = Math.floor(timeInMilliseconds / (1000 * 60 * 60));
        timeInMilliseconds = timeInMilliseconds % (1000 * 60 * 60);
      
        const minutes = Math.floor(timeInMilliseconds / (1000 * 60));
        timeInMilliseconds = timeInMilliseconds % (1000 * 60);
      
        const seconds = Math.floor(timeInMilliseconds / 1000);
      
        // Format numbers as two-digit strings
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
      
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    getTotalTimeToAnswer(resultData) {
        let totalTimeToAnswer = 0;
        totalTimeToAnswer += resultData.correct.reduce((accumulator, answer) => accumulator += answer.timeToAnswer, 0);
        totalTimeToAnswer += resultData.incorrect.reduce((accumulator, answer) => accumulator += answer.timeToAnswer, 0);

        return totalTimeToAnswer;
    }
}

const stats = new Stats();