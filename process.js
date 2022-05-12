import { db, app } from "./services/firestore.js";
import { collection, getDocs, getDoc, onSnapshot, doc, connectFirestoreEmulator } from "firebase/firestore";


console.log('running processes...')


let name;
const zones = [];
const systemRef = doc(db, "systems", "MEeFIW6GwQtv1X3Lo7Z2")
const docSnap = await getDoc(systemRef);
const regex = new RegExp('^zone')
const today = Date.now();

if (docSnap.exists()) {

    //console.log("Document data:", docSnap.data());
    name = docSnap.data()

} else {
    //doc.data() will be undefined in this case

    console.log("No such document!");
}
Object.keys(name).filter((key) => {
    if (regex.test(key)) {
        zones.push(name[key])
    }
})
const numberOfDays = getDaysAgo(new Date(), 2);

zones.forEach((zone, zoneNumber) => {
    console.log('zone' + zoneNumber + '\n')
    zone.lineRT.forEach(element => {
        console.log(element.timeStamp < numberOfDays)
    })
    // console.log("zone" + zoneNumber, Object.keys(zone.lineRT))
});
//console.log(name.zone12.lineRT)


function getDaysAgo(date, days) {
    var pastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
    return pastDate;
}

