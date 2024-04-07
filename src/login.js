import firebaseService from './firebase-service.js';

export class Login
{
    constructor() {
        const loginForm = document.querySelector('.js-login-form');
        if (!loginForm) {
            return;
        }

        const loginEmailPassword = async () => {
            const loginEmail = document.querySelector('.js-email').value;
            const loginPassword = document.querySelector('.js-password').value;
        
            try {
                await firebaseService.login(loginEmail, loginPassword);
                window.location.href = '/';
            }
            catch (error) {
                console.log(error);
                const errorMessage = getErrorMessageFromFirebaseError(error);
                const errorNoticeElem = document.querySelector('.js-error-notice');
                if (errorNoticeElem) {
                    errorNoticeElem.textContent = errorMessage;
                    errorNoticeElem.classList.remove('hidden');
                } else {
                    errorNoticeElem.classList.add('hidden');
                }
            }        
        }

        const getErrorMessageFromFirebaseError = (error) => {
            let errorMessage;

            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    errorMessage = 'Incorrect email or password.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This user account has been disabled.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred.';
            }

            return errorMessage;
        }
        
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            loginEmailPassword();
        });
    }
}

const login = new Login();