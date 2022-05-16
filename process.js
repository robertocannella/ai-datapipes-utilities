// This script retrieves stored data from google firestore,
// copies it into a mongoDB, then removes it from firestore
// 


// *********************************************************************
//
// Imports
//
// *********************************************************************

import { afs, app } from "./services/firestore.js";
import { ObjectId } from "bson";
import { getDoc, doc } from "firebase/firestore";
import { System } from "./models/system.js";
import { db } from './services/mongoose.js';
import { mongoose } from 'mongoose';
console.log('running processes...')



// *********************************************************************
//
// Retrieve the data from google firestore
//
// *********************************************************************


// the google firestore doc
let document;

// to store the names of objects begining with zone (/^zone/)
var zones = [];
const regex = new RegExp('^zone')

// the id of the current system
const system_id = "MEeFIW6GwQtv1X3Lo7Z2";

// firestore commands
const systemRef = doc(afs, "systems", "MEeFIW6GwQtv1X3Lo7Z2")
const docSnap = await getDoc(systemRef);

// compartor for daysAgo function
const today = Date.now();
const numberOfDays = getDaysAgo(new Date(), 8);
console.log(new Date(numberOfDays))
// verify the document exists
if (docSnap.exists()) {

    //console.log("Document data:", docSnap.data());
    document = docSnap.data()
} else {
    //doc.data() will be undefined in this case
    console.log("No such document!");
}

// filter through the keys of the documents for fields begining with zone (/^zone/)
Object.keys(document).filter((key) => {
    if (regex.test(key)) {
        // add custom object including zone common name.
        zones.push({ [document[key].name]: document[key] })
    }
})

//console.log(zones)
// filter the data for database insertion
zones = filterDataByTimeStamp(zones)


// END Retrieve the data from google firestore
// *********************************************************************


// *********************************************************************
//
// Store the data into Mongo DB
//
// *********************************************************************


// start the database connection
db();


// set filter for system
let filter = { _id: system_id.toString() }

// verify system exists, if not, create one
System.findOne(filter, async function (err, system) {
    if (err) {
        console.log(err)
        return
    }
    if (system === null)
        // create system if one does not exist
        system = new System({ _id: system_id })
    await system.save(async () => {
        // execute copy into MongoDB
        //checkForExistingEntries();
        populateMongoDb();
    })
});


// main function to populate the mongoDB
async function populateMongoDb() {
    zones.forEach((zone) => {
        for (const property in zone) {
            console.log(`${property}`)
            zone[property].forEach((element, index) => {
                var exists;
                System.findOne({ "_id": system_id, [property + ".lineRT"]: { $elemMatch: { 'timeStamp': element.timeStamp } } }, { "_id": 1, [property.lineRT]: 1 })
                    .then(async (doc) => {
                        //console.log("processing entry no. ", count++, "\r")
                        if (doc) {
                            exists = true
                            //console.log("match found in", currentZoneLabel)
                        }
                        // if the array is empty, then we need to add the entry to mongoDB
                        if (exists) {
                            console.log("skipping ", property)
                            return;
                        } else {
                            console.log("creating document for db insertion")
                            // create the entry object
                            let reading = {
                                _id: generateObjIdFromTime(element.timeStamp),
                                timeStamp: element.timeStamp,
                                degF: element.degF
                            };
                            // append the array, searching by id and previously determined location string

                            System.findByIdAndUpdate(system_id, { $push: { [property + ".lineRT"]: reading } }, async (err, system) => {
                                if (err) {
                                    console.log(err)
                                    return;
                                }
                                //console.log("adding", + currentZoneLabel, reading)
                            })
                        }
                    })
                //console.log(element)
            })
        }
    })
}
async function populateMongoDbOld() {

    // for each [key,value] in zones, exectute the anonymous function 
    zones.forEach((zone, zoneNumber) => {
        ``
        // for each [element] inside the lineRT Array within the zone, execute the anonymous function
        zone.forEach(async (element, index) => {
            // the cuurent lookup string for mongoose to uniquely identify each field
            let currentZoneLabel = "zone1" + zoneNumber + ".lineRT";
            // compare the timestamp of the entry, filtering out newer entries

            var exists
            // If an entry exists for the given timestamp, return, otherwise add the entry
            System.findOne({ "_id": system_id, [currentZoneLabel]: { $elemMatch: { 'timeStamp': element.timeStamp } } }, { "_id": 0, [currentZoneLabel]: 1 }).then(async (doc) => {
                //console.log("processing entry no. ", count++, "\r")
                if (doc) {
                    exists = true
                    //console.log("match found in", currentZoneLabel)
                }
                // if the array is empty, then we need to add the entry to mongoDB
                if (exists) {
                    console.log("skipping ", currentZoneLabel)
                    return;
                } else {
                    console.log("creating document for db insertion")
                    // create the entry object
                    let reading = {
                        _id: generateObjIdFromTime(element.timeStamp),
                        timeStamp: element.timeStamp,
                        degF: element.degF
                    };
                    // append the array, searching by id and previously determined location string

                    System.findByIdAndUpdate(system_id, { $push: { [currentZoneLabel]: reading } }, async (err, system) => {
                        if (err) {
                            console.log(err)
                            return;
                        }
                        //console.log("adding", + currentZoneLabel, reading)
                    })
                }
            })
        })
        //console.log('Completed zone1', zoneNumber, "\n", count)
    })
}

// END Store the data into Mongo DB
// *********************************************************************


// *********************************************************************
//
// Utiliy functions begin here
//
// *********************************************************************


// check for exsisting entries

function checkForExistingEntries() {
    let count = 0;

    // sort the objects by timestamp 

    // SAMPLE FILTER FUNCTION
    // obj = obj.filter(function (user, index) {
    //     return (user.index !== 5 && user.index !== 2);
    // });


    let array = zones[0].lineRT.filter(function (element, index) {
        // compare the timestamp of the entry, filtering out newer entries
        let dateToCheck = new Date(element.timeStamp)
        return (dateToCheck <= numberOfDays)
    })

    array.forEach(reading => {
        console.log(new Date(reading.timeStamp), reading.timeStamp)
    })

}

// filter reading by timeStamp
function filterDataByTimeStamp(zonesArray) {
    var filteredArrays = [];

    zonesArray.forEach(function (zone) {
        for (const property in zone) {
            let name = zone[property].name;
            let lineRT = zone[property].lineRT.filter(function (element, index) {
                let dateToCheck = new Date(element.timeStamp)
                return (dateToCheck <= numberOfDays)

            });
            filteredArrays.push({ [name]: lineRT })
        }
    })
    return filteredArrays;
}

// generate a bson Object ID
function generateObjIdFromTime(spefictime) {
    spefictime = ~~(spefictime / 1000);
    return ObjectId(spefictime);
}
// get a timestamp for comparing
function getDaysAgo(date, days) {
    var pastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
    return pastDate;
}

// avoid duplicate entries in mongoDB by checking if timestamp exists
async function exists(timeToMatch, zoneLabel) {
    System.findOne({ _id: system_id }, (err, system) => {
        let exists = system[zoneLabel].lineRT.filter((data) => {
            return (data.timeStamp === timeToMatch)

        })
        if (err) console.log(err);
        console.log(exists.length > 0);
    })
}

// TODO: close DB.  I cannot get this work.  I can't seem to find the correct callback function.
async function closeDB() {
    console.log('closing database...')
    await mongoose.db.disconnect((err) => {
        console.log('closed', err)
    });

}