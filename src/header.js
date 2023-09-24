import firebaseService from './firebase-service.js';

export class Header {
    constructor() {
        if (!document.querySelector('.js-header')) {
            return;
        }

        const header = document.querySelector('.js-header');

        firebaseService.setAuthStateChangedCallback((user) => {
            if (user) {
                header.classList.add('header--logged-in');
            } else {
                header.classList.remove('header--logged-in');
            }
        });

        const logoutBtn = document.querySelector('.js-logout-btn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutHandler();
        });

        const logoutHandler = async () => {
            try {
                await firebaseService.logout();
            } catch (error) {
                console.log('error:', error);
            }
        }
    }
}

const header = new Header();