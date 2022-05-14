import { afs, app } from "./services/firestore.js";
import { getDoc, doc } from "firebase/firestore";
import { System } from "./models/system.js";
import { db } from './services/mongoose.js';
import { mongoose } from 'mongoose';
console.log('running processes...')


let name;
const zones = [];
const system_id = "MEeFIW6GwQtv1X3Lo7Z2";
const systemRef = doc(afs, "systems", "MEeFIW6GwQtv1X3Lo7Z2")
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
const numberOfDays = getDaysAgo(new Date(), 5);
db();


let filter = { _id: system_id.toString() }

System.findOne(filter, async function (err, system) {
    if (err) {
        console.log(err)
        return
    }
    if (system === null)
        system = new System({ _id: system_id })
    await system.save(async () => {
        await populateMongoDb(() => {
            console.log('done')
        })


    })


});

async function closeDB() {
    console.log('closing database...')
    await mongoose.db.disconnect((err) => {
        console.log('closed', err)
    });

}
async function populateMongoDb() {
    zones.forEach((zone, zoneNumber) => {

        zone.lineRT.forEach(async (element) => {
            let currentZoneLabel = "zone1" + zoneNumber + ".lineRT";
            if (element.timeStamp < numberOfDays) {
                //console.log(new Date(element.timeStamp), ': ', element.degF)
                let reading = {
                    timeStamp: element.timeStamp,
                    degF: element.degF
                };
                System.findByIdAndUpdate(system_id, { $push: { [currentZoneLabel]: reading } }, function (err, system) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    console.log(currentZoneLabel, reading)

                })

            }

        })
    })
}
function getDaysAgo(date, days) {
    var pastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
    return pastDate;
}

