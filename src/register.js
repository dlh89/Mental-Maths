import firebaseService from './firebase-service.js';

export class Register
{
    constructor() {
        const registerForm = document.querySelector('.js-register-form');
        if (!registerForm) {
            return;
        }
        
        registerForm.addEventListener('submit', e => {
            console.log('submit');
            e.preventDefault();
            createAccount();
        });
    
        const createAccount = async () => {
            const loginEmail = document.querySelector('.js-email').value;
            const loginPassword = document.querySelector('.js-password').value;
        
            try {
                await firebaseService.createAccount(loginEmail, loginPassword);
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
                case 'auth/weak-password':
                    errorMessage = 'The provided password is too weak.';
                case 'auth/email-already-exists':
                    errorMessage = 'The provided email is already in use by an existing user.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred.';
            }

            return errorMessage;
        }
    }
}

const register = new Register();