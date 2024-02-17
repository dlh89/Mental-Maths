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

    stats = [];

    constructor() {
        this.utils = new Utils();
        const statsContainer = document.querySelector('.js-stats-container');
        if (!statsContainer) {
            return;
        }

        this.utils.animateLoadingEllipsis();

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
            this.stats.push(result.data());
        });

        this.clearLoadingEllipsis();
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
        const totalCorrectAnswers = this.stats.reduce((accum, session) => {
            return accum += this.getCorrectAnswerCount(session.answers);
        }, 0);
        const totalQuestionsAnswered = this.stats.reduce((accum, session) => {
            return accum += session.answers.length;
        }, 0);
        const overallCorrectPercentageElem = document.querySelector('.js-overall-correct-percentage');
        overallCorrectPercentageElem.textContent = totalQuestionsAnswered ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) + '%': 'N/A';

        const totalTimePlayed = this.stats.reduce((accum, session) => {
            return accum += this.getSessionLength(session.startTime, session.endTime);
        }, 0);
        const totalTimePlayedElem = document.querySelector('.js-total-time-played');
        totalTimePlayedElem.textContent = this.utils.getFormattedMilliseconds(totalTimePlayed);

        const totalAverageTimeToAnswer = this.stats.reduce((accum, session) => {
            return accum += this.getAverageTimeToAnswer(session.answers);
        }, 0);
        const averageTimeToAnswerElem = document.querySelector('.js-average-time-to-answer');
        averageTimeToAnswerElem.textContent = this.utils.getFormattedMilliseconds(totalAverageTimeToAnswer * 1000);
    }

    populateTable() {
        const resultsTbody = document.querySelector('.js-results-tbody');
        const resultsRow = document.querySelector('.js-results-row');

        this.stats.forEach((session) => {
            const resultsRowClone = resultsRow.cloneNode(true);
            const resultsDate = resultsRowClone.querySelector('.js-results-date');
            const resultsStartTime = resultsRowClone.querySelector('.js-results-start-time');
            const resultsEndTime = resultsRowClone.querySelector('.js-results-end-time');
            const resultsScore = resultsRowClone.querySelector('.js-results-score');
            const resultsPercentage = resultsRowClone.querySelector('.js-results-percentage');
            const sessionLengthElem = resultsRowClone.querySelector('.js-session-length');
            const averageTimeToAnswerElem = resultsRowClone.querySelector('.js-average-time-to-answer');

            const correctAnswerCount = this.getCorrectAnswerCount(session.answers);

            resultsDate.textContent = this.getSessionStartDate(session);
            resultsStartTime.textContent = new Date(session.startTime).toLocaleTimeString();
            resultsEndTime.textContent = new Date(session.endTime).toLocaleTimeString();
            resultsScore.textContent = `${correctAnswerCount} / ${session.answers.length}`;
            resultsPercentage.textContent = `${Math.round(correctAnswerCount / session.answers.length * 100)}%`;
            sessionLengthElem.textContent = this.utils.getFormattedMilliseconds(this.getSessionLength(session.startTime, session.endTime));
            averageTimeToAnswerElem.textContent = this.utils.getFormattedMilliseconds(this.getAverageTimeToAnswer(session.answers) * 1000);
            resultsTbody.appendChild(resultsRowClone);
        })

        resultsRow.style.display = 'none';
    }

    getCorrectAnswerCount(answers) {
        return answers.reduce((accum, answer) => {
            if (answer.isCorrect) {
                accum++;
            }
            return accum;
        }, 0);
    }

    /**
     * Returns session length in milliseconds
     * 
     * @param {string} startTime 
     * @param {string} endTime 
     * @returns string
     */
    getSessionLength(startTime, endTime) {
        return endTime - startTime;
    }

    getAverageTimeToAnswer(answers) {
        const totalTimeToAnswer = answers.reduce((accum, answer) => {
            return accum += answer.timeToAnswer;
        }, 0);

        return totalTimeToAnswer / answers.length;
    }

    getSessionStartDate(session) {
        return new Date(session.startTime).toLocaleDateString('en-GB');
    }

    populateChart() {
        const correctAnswersCtx = document.getElementById('correctAnswersChart');
        const timeToAnswerCtx = document.getElementById('timeToAnswerChart');
        this.stats.reverse(); // reverse the data to make it chronological

        new Chart(correctAnswersCtx, {
            type: 'line',
            data: {
                labels: this.stats.map(session => this.getSessionStartDate(session)),
                datasets: [
                    {
                        label: 'Correct answers percentage',
                        data: this.stats.map(session => (this.getCorrectAnswerCount(session.answers) / session.answers.length) * 100),
                        fill: false,
                        borderColor: 'rgb(13 110 253)',
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
                labels: this.stats.map(session => this.getSessionStartDate(session)),
                datasets: [
                    {
                        label: 'Average time to answer',
                        data: this.stats.map(session => this.getAverageTimeToAnswer(session.answers)),
                        fill: false,
                        borderColor: 'rgb(13 110 253)',
                        tension: 0
                    },
                ]
            }
        });
    }

    clearLoadingEllipsis() {
        let ellipsisElems = document.querySelectorAll('.js-loading-ellipsis');
        for (const ellipsisElem of ellipsisElems) {
            ellipsisElem.classList.remove('js-loading-ellipsis');
            clearInterval(ellipsisElem.intervalId)
        }
    }
}

const stats = new Stats();