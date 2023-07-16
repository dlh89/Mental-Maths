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
import {
    getFirestore,
    doc,
    setDoc,
} from 'firebase/firestore';// https://firebase.google.com/docs/web/setup#available-libraries

export class FirebaseService {
    auth;
    db;
    analytics;

    constructor() {
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
        this.analytics = getAnalytics(app);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
        connectAuthEmulator(this.auth, 'http://localhost:9099');

        const monitorAuthState = async () => {
            onAuthStateChanged(this.auth, user => {
                if (user !== null) {
                    console.log('logged in!');
                } else {
                    console.log('no user');
                }
            });
        }

        monitorAuthState();
    }

    login(loginEmail, loginPassword) {
        return signInWithEmailAndPassword(this.auth, loginEmail, loginPassword);
    }

    logout() {
        return signOut(this.auth);
    }

    async createAccount(loginEmail, loginPassword) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, loginEmail, loginPassword);
            console.log('userCredential:', userCredential);

            return userCredential;
        } catch (error) {
            console.error('Error signing up:', error);
        }
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;