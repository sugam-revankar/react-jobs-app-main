import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


 const app = firebase.initializeApp({
    apiKey: "AIzaSyBpGJta6aGTuPARTBglrlgaU7xO3utofbA",
    authDomain: "jobs-673cc.firebaseapp.com",
    databaseURL: "https://jobs-673cc-default-rtdb.firebaseio.com",
    projectId: "jobs-673cc",
    storageBucket: "jobs-673cc.appspot.com",
    messagingSenderId: "300809813628",
    appId: "1:300809813628:web:13ebd20b01c27b051693f9"
});

export const auth=app.auth();
export const dbstore=app.firestore();
export default app;
