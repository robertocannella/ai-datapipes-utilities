import db from "./services/firestore.js";
import { collection, getDocs, getDoc, onSnapshot, doc } from "firebase/firestore";


console.log('running processes...')


let systemID;

const systemRef = doc(db, "systems", "MEeFIW6GwQtv1X3Lo7Z2")
const docSnap = await getDoc(systemRef)

if (docSnap.exists()) {

    //console.log("Document data:", docSnap.data());
} else {
    // doc.data() will be undefined in this case

    console.log("No such document!");
}





