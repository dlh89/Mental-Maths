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
        const resultsTbody = document.querySelector('.js-results-tbody');
        const resultsRow = document.querySelector('.js-results-row');

        playerStats.forEach((result) => {
            const resultData = result.data();
            const correctPercentageString = Math.round(resultData.correct.length / (resultData.correct.length + resultData.incorrect.length) * 100) + '%';

            const resultsRowClone = resultsRow.cloneNode(true);
            const resultsDate = resultsRowClone.querySelector('.js-results-date');
            const resultsStartTime = resultsRowClone.querySelector('.js-results-start-time');
            const resultsEndTime = resultsRowClone.querySelector('.js-results-end-time');
            const resultsScore = resultsRowClone.querySelector('.js-results-score');
            const resultsPercentage = resultsRowClone.querySelector('.js-results-percentage');
            const startTime = resultData?.metaData?.startTime;
            const endTime = resultData?.metaData?.endTime;
            resultsDate.textContent = startTime ? new Date(startTime).toLocaleDateString() : '';
            resultsStartTime.textContent = startTime ? new Date(startTime).toLocaleTimeString() : '';
            resultsEndTime.textContent = endTime ? new Date(endTime).toLocaleTimeString() : '';
            resultsScore.textContent = `${resultData.correct.length} / ${resultData.correct.length + resultData.incorrect.length}`;
            resultsPercentage.textContent = correctPercentageString;

            resultsTbody.appendChild(resultsRowClone);
        });

        resultsRow.style.display = 'none';

        return playerStats;
    }
}

const stats = new Stats();