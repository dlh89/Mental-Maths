import firebaseService from './firebase-service.js';
import Chart from 'chart.js/auto';
import { Utils } from './utils.js';

export class Stats
{
    formattedStats = {
        'sessions': [],
        'totals': {
            'totalCorrectAnswers': 0,
            'totalIncorrectAnswers': 0,
            'totalTimeToAnswer': 0,
            'totalTimePlayed': 0,
            'totalQuestionsAnswered': 0,
        }
    };


    constructor() {
        this.utils = new Utils();
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
       
        playerStats.forEach((result) => {
            const resultData = result.data();
            const sessionQuestionsAnswered = resultData.correct.length + resultData.incorrect.length;
            this.formattedStats.totals.totalCorrectAnswers += resultData.correct.length;
            this.formattedStats.totals.totalIncorrectAnswers += resultData.incorrect.length;
            this.formattedStats.totals.totalQuestionsAnswered += sessionQuestionsAnswered;
            const sessionLength = Math.abs(resultData.endTime - resultData.startTime);
            this.formattedStats.totals.totalTimePlayed += sessionLength;
            const correctPercentageString = Math.round(resultData.correct.length / (resultData.correct.length + resultData.incorrect.length) * 100) + '%';
            const sessionTotalTimeToAnswer = this.getTotalTimeToAnswer(resultData);
            this.formattedStats.totals.totalTimeToAnswer += sessionTotalTimeToAnswer;

            this.formattedStats.sessions.push(
                {
                    'sessionQuestionsAnswered': sessionQuestionsAnswered,
                    'sessionLength': sessionLength,
                    'correctPercentageString': correctPercentageString,
                    'sessionTotalTimeToAnswer': sessionTotalTimeToAnswer,
                    'startDate': new Date(resultData.startTime).toLocaleDateString('en-GB'),
                    'startTime': new Date(resultData.startTime).toLocaleTimeString(),
                    'endTime': new Date(resultData.endTime).toLocaleTimeString(),
                    'correctAnswers': resultData.correct.length,
                    'incorrectAnswers': resultData.incorrect.length,
                },
            );
        });

        this.populateGlobalStats();
        this.populateTable();
        this.populateChart();
    }

    getTotalTimeToAnswer(resultData) {
        let totalTimeToAnswer = 0;
        totalTimeToAnswer += resultData.correct.reduce((accumulator, answer) => accumulator += answer.timeToAnswer, 0);
        totalTimeToAnswer += resultData.incorrect.reduce((accumulator, answer) => accumulator += answer.timeToAnswer, 0);

        return totalTimeToAnswer;
    }

    populateGlobalStats() {
        const overallCorrectPercentageElem = document.querySelector('.js-overall-correct-percentage');
        overallCorrectPercentageElem.textContent = Math.round((this.formattedStats.totals.totalCorrectAnswers / (this.formattedStats.totals.totalCorrectAnswers + this.formattedStats.totals.totalIncorrectAnswers)) * 100) + '%';
        const totalTimePlayedElem = document.querySelector('.js-total-time-played');
        totalTimePlayedElem.textContent = this.utils.getFormattedMilliseconds(this.formattedStats.totals.totalTimePlayed);
        const averageTimeToAnswer = document.querySelector('.js-average-time-to-answer');
        averageTimeToAnswer.textContent = this.utils.getFormattedMilliseconds((this.formattedStats.totals.totalTimeToAnswer / this.formattedStats.totals.totalQuestionsAnswered) * 1000);
    }

    populateTable() {
        const resultsTbody = document.querySelector('.js-results-tbody');
        const resultsRow = document.querySelector('.js-results-row');

        this.formattedStats.sessions.forEach((session) => {
            const resultsRowClone = resultsRow.cloneNode(true);
            const resultsDate = resultsRowClone.querySelector('.js-results-date');
            const resultsStartTime = resultsRowClone.querySelector('.js-results-start-time');
            const resultsEndTime = resultsRowClone.querySelector('.js-results-end-time');
            const resultsScore = resultsRowClone.querySelector('.js-results-score');
            const resultsPercentage = resultsRowClone.querySelector('.js-results-percentage');
            const sessionLengthElem = resultsRowClone.querySelector('.js-session-length');
            const averageTimeToAnswerElem = resultsRowClone.querySelector('.js-average-time-to-answer');

            resultsDate.textContent = session.startDate;
            resultsStartTime.textContent = session.startTime,
            resultsEndTime.textContent = session.endTime,
            resultsScore.textContent = `${session.correctAnswers} / ${session.correctAnswers + session.incorrectAnswers}`;
            resultsPercentage.textContent = session?.correctPercentageString;
            sessionLengthElem.textContent = this.utils.getFormattedMilliseconds(session?.sessionLength);
            averageTimeToAnswerElem.textContent = this.utils.getFormattedMilliseconds((session?.sessionTotalTimeToAnswer / session?.sessionQuestionsAnswered) * 1000);
            resultsTbody.appendChild(resultsRowClone);
        })

        resultsRow.style.display = 'none';
    }

    populateChart() {
        const correctAnswersCtx = document.getElementById('correctAnswersChart');
        const timeToAnswerCtx = document.getElementById('timeToAnswerChart');
        this.formattedStats.sessions.reverse(); // reverse the data to make it chronological

        new Chart(correctAnswersCtx, {
            type: 'line',
            data: {
                labels: this.formattedStats.sessions.map(session => session.startDate),
                datasets: [
                    {
                        label: 'Correct answers percentage',
                        data: this.formattedStats.sessions.map(session => (session.correctAnswers / session.sessionQuestionsAnswered) * 100),
                        fill: false,
                        borderColor: 'rgb(0 116 57)',
                        tension: 0
                    },
                ]
            },
            options: {
                scales: {
                    y: {
                        suggestedMin: 0,
                    }
                }
            }
        });

        new Chart(timeToAnswerCtx, {
            type: 'line',
            data: {
                labels: this.formattedStats.sessions.map(session => session.startDate),
                datasets: [
                    {
                        label: 'Average time to answer',
                        data: this.formattedStats.sessions.map(session => session.sessionTotalTimeToAnswer / (session.incorrectAnswers + session.correctAnswers)),
                        fill: false,
                        borderColor: 'rgb(0 116 57)',
                        tension: 0
                    },
                ]
            }
        });
    }
}

const stats = new Stats();