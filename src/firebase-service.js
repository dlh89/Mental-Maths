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
    connectFirestoreEmulator,
    doc,
    setDoc,
    getDoc,
    collection,
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
        // connectAuthEmulator(this.auth, 'http://localhost:9099');
        // connectFirestoreEmulator(this.db, 'http://localhost:8080');

        const monitorAuthState = async () => {
            onAuthStateChanged(this.auth, user => {
                if (user !== null) {
                    console.log('logged in!');
                    console.log('user:', user);
                } else {
                    console.log('no user');
                }

                if (this.authStateChangedCallback) {
                    this.authStateChangedCallback(user);
                }
            });
        }

        monitorAuthState();
    }

    setAuthStateChangedCallback(callback) {
        this.authStateChangedCallback = callback;
    }

    login(loginEmail, loginPassword) {
        return signInWithEmailAndPassword(this.auth, loginEmail, loginPassword);
    }

    logout() {
        return signOut(this.auth);
    }

    async createAccount(loginEmail, loginPassword) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, loginEmail, loginPassword);
        await setDoc(doc(this.db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
        });

        return userCredential;
    }

    async pushResultsToDb(userId, results) {
        const userDocRef = doc(this.db, 'users', userId);
        const userCollectionRef = collection(userDocRef, 'results');
        await setDoc(doc(userCollectionRef), results);
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;