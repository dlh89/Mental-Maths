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
                await firebaseService.login(loginEmail, loginPassword)
            }
            catch (error) {
                console.log(error);
            }
        
        }
        
        const loginBtn = document.querySelector('.js-login-btn');
        loginBtn.addEventListener('click', e => {
            e.preventDefault();
            loginEmailPassword();
        });
        
        const registerBtn = document.querySelector('.js-register-btn');
        registerBtn.addEventListener('click', e => {
            e.preventDefault();
            createAccount();
        });
    
        const createAccount = async () => {
            const loginEmail = document.querySelector('.js-email').value;
            const loginPassword = document.querySelector('.js-password').value;
        
            try {
                const userCredentail = await firebaseService.createAccount(loginEmail, loginPassword);
                console.log(userCredentail.user);
            }
            catch (error) {
                console.log(error);
            }
        }
    
        
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

const login = new Login();