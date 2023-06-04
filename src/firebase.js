// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
    getAuth,
    onAuthStateChanged,
    connectAuthEmulator,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyAp--PIPUoIapWs-lirRfC0E020nxTjcDA',
    authDomain: 'mental-maths-80d9b.firebaseapp.com',
    projectId: 'mental-maths-80d9b',
    storageBucket: 'mental-maths-80d9b.appspot.com',
    messagingSenderId: '99592885883',
    appId: '1:99592885883:web:ad1744100e3b4e421e34de',
    measurementId: 'G-T42GK949Z4'
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, 'http://localhost:9099');

  const loginEmailPassword = async () => {
    const loginEmail = document.querySelector('.js-email').value;
    const loginPassword = document.querySelector('.js-password').value;

    try {
        const userCredentail = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log(userCredentail.user);
    }
    catch(error) {
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

const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user !== null) {
            console.log('logged in!');
        } else {
            console.log('no user');
        }
    });
}

monitorAuthState();

const createAccount = async () => {
    const loginEmail = document.querySelector('.js-email').value;
    const loginPassword = document.querySelector('.js-password').value;

    try {
        const userCredentail = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log(userCredentail.user);
    }
    catch(error) {
        console.log(error);
    }
}

const logout = async () => {
    await signOut(auth);
}

const logoutBtn = document.querySelector('.js-logout-btn');
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});