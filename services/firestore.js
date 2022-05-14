import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "config";


// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {

    apiKey: config.get("firebaseConfig.apiKey"),
    authDomain: config.get("firebaseConfig.authDomain"),
    projectId: config.get("firebaseConfig.projectId"),
    storageBucket: config.get("firebaseConfig.storageBucket"),
    messagingSenderId: config.get("firebaseConfig.messagingSenderId"),
    appId: config.get("firebaseConfig.appId"),
    measurementId: config.get("firebaseConfig.measurementId")

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const afs = getFirestore(app);

export { afs, app };