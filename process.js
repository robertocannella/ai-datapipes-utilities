// This script retrieves stored data from google firestore,
// copies it into a mongoDB, then removes it from firestore
// 


// *********************************************************************
//
// Imports
//
// *********************************************************************

// Common imports
import { getDoc, doc, setDoc, collection, getFirestore, arrayUnion, arrayRemove, FieldValue, deleteField, getDocs, updateDoc } from "firebase/firestore";       // Google firestore methods 
import { ObjectId } from "bson";                        // For gerenating a unique id on MongoDB
import { mongoose } from 'mongoose';                    // Mongoose connection manager
// Custom imports
import { afs } from "./services/firestore.js";          // Google firestore service
import { db, connection } from './services/mongoose.js';            // Mongoose Service
import { System } from "./models/system.js";            // System Model (Heating/Cooling)


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
var categories;
const regex = new RegExp('^zone1')

// the id of the current system
const system_id = "MEeFIW6GwQtv1X3Lo7Z2";

// firestore commands
const systemRef = doc(afs, "systems", "MEeFIW6GwQtv1X3Lo7Z2")
const docSnap = await getDoc(systemRef);

// compartor for daysAgo function
const today = Date.now();
const numberOfDays = getDaysAgo(new Date(), 1);

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

//  get the individual category name
categories = getCategories(zones);

// filter the data for database insertion by date
zones = filterDataByTimeStamp(zones);


// END Retrieve the data from google firestore
// *********************************************************************


// *********************************************************************
//
// Insert the data into Mongo DB
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
        // create new system if one does not exist
        system = new System({ _id: system_id })
    system.save(async () => {
        // execute copy into MongoDB
        //categories.forEach((category) => { populateMongoDbWithCategory(category) })

        populateMongoDb().then((count) => console.log('finished: ', count));
        //await verifyAllEntryiesExistMongoDB();
        //deleteFireStoreFields();
    })
})

async function logChangeStream() {


    const collection = connection.collection('customers');
    const changeStream = collection.watch();
    changeStream.on('change', next => {
        // process next document
        console.log("Change", next)
    });
}
async function deleteFireStoreFields(currentZone, currentCategory, currentReadings) {

    currentZone = 'zone10';
    currentCategory = 'lineRT';
    currentReadings = [
        {
            timeStamp: 1652797403659,
            degF: 97.8
        },
        {
            timeStamp: 1652797238965,
            degF: 98.3
        },
        {
            timeStamp: 1652797524793,
            degF: 97.8
        },
        {
            timeStamp: 1652797538278,
            degF: 98.3
        }

    ]
    const db = getFirestore();


    // Append a new objects into nested array
    // currentReadings.forEach((async (reading) => {
    //     await updateDoc(doc(db, "cites", "LA"), { [`${currentZone}.${currentCategory}`]: arrayUnion({ reading }) })
    // }))

    // Remove specific element from nested array
    currentReadings.forEach((async (reading) => {
        console.log("Removing: ", reading)
        await updateDoc(doc(db, "cites", "LA"), {
            [`${currentZone}.${currentCategory}`]: arrayRemove(
                {
                    reading
                }
            )
        })
    }))

}
// verifying all entries are inserted into MongoDB
async function verifyAllEntryiesExistMongoDB() {
    zones.forEach((zone) => {
        for (const property in zone) {
            console.log(`${property}:\n${Object.keys(zone[property])}\n`)
            // zone[property].forEach((element, index) => {
            //     var exists;
            //     System.findOne(
            //         { "_id": system_id, [property + ".lineRT"]: { $elemMatch: { 'timeStamp': element.timeStamp } } },
            //         { "_id": 1, [property.lineRT]: 1 })
            //         .then(async (doc) => { console.log(doc) })

            // })
        }
    })

}


// main function to populate the mongoDB
async function populateMongoDbWithCategory(category) {
    console.log(category)
    zones.forEach((zone) => {
        for (const property in zone) {
            console.log(`${property}`)
            zone[property].forEach((element, index) => {
                var exists;
                System.findOne({ "_id": system_id, [property + "." + category]: { $elemMatch: { 'timeStamp': element.timeStamp } } }, { "_id": 1, [property.lineRT]: 1 })
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
                            //console.log(property, "creating document for db insertion")
                            // create the entry object
                            let reading = {
                                _id: generateObjIdFromTime(element.timeStamp),
                                timeStamp: element.timeStamp,
                                degF: element.degF
                            };
                            // append the array, searching by id and previously determined location string

                            System.findByIdAndUpdate(system_id, { $push: { [property + "." + category]: reading } }, async (err, system) => {
                                if (err) {
                                    console.log(err)
                                    return;
                                }
                                //console.log("adding", + currentZoneLabel, reading)
                            })
                        }
                    })

            })
        }
    })
}
async function populateMongoDb() {
    var readCount = 0;
    var writeCount = 0;
    zones.forEach((zone) => {
        for (const property in zone) {
            console.log(`${property}`)
            zone[property].forEach((element, index) => {
                var exists;
                readCount++
                System.findOne({ "_id": system_id, [property + ".lineRT"]: { $elemMatch: { 'timeStamp': element.timeStamp } } }, { "_id": 1, [property.lineRT]: 1 })
                    .then(async (doc) => {

                        //console.log("processing entry no. ", count++, "\r")
                        if (doc) {
                            exists = true
                            //console.log("match found in", currentZoneLabel)
                        }
                        // if the array is empty, then we need to add the entry to mongoDB
                        if (exists) {
                            //console.log("skipping: ", property)
                            readCount--;

                        } else {
                            writeCount++;
                            //console.log(property, ": creating document for db insertion")
                            // create the entry object
                            let reading = {
                                _id: generateObjIdFromTime(element.timeStamp),
                                timeStamp: element.timeStamp,
                                degF: element.degF
                            };
                            // append the array, searching by id and previously determined location string

                            System.findByIdAndUpdate(system_id, { $push: { [property + ".lineRT"]: reading } }, { writeConcern: { w: 1 } }, async (err, doc) => {
                                //console.log('done')
                                if (err) {
                                    console.log(err)
                                    return;
                                } else {
                                    console.info('writing: ', writeCount);
                                    writeCount--;
                                }
                                console.info(writeCount);
                                if (writeCount === 0) {
                                    await mongoose.connection.close();
                                    process.exit();
                                }
                                //console.log("adding", + currentZoneLabel, reading)
                            })

                        }
                        if ((readCount % 100) === 0 || readCount < 100)
                            console.info('skipping: ', readCount);
                        if (readCount === 0) {
                            await mongoose.connection.close();
                            process.exit()
                        }
                    })
            })
        }
    })
}
async function populateMongoDbOld_1() {

    // for each [key,value] in zones, exectute the anonymous function 
    zones.forEach((zone, zoneNumber) => {
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
                    //console.log("skipping ", currentZoneLabel)
                    return;
                } else {
                    //console.log("creating document for db insertion")
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

// get individual sensor categories.  zone array consists of a 
// property 'name' which is ignored
// all other properites are named sensor types 

function getCategories(zonesArray) {

    const readingCategories = new Set()
    zonesArray.forEach(function (zone) {
        for (const property in zone) {
            Object.keys(zone).filter((key) => {
                Object.keys(zone[key]).forEach((key) => { if (key !== 'name') readingCategories.add(key) })
            })
        }
    })
    console.log(readingCategories)

    return readingCategories

}
// filter reading by timeStamp
function filterDataByTimeStamp(zonesArray) {
    var filteredArrays = [];
    let oneDay = getDaysAgo(numberOfDays, 1)
    zonesArray.forEach(function (zone) {
        for (const property in zone) {

            //console.log(Object.keys(zone[property]))
            let name = zone[property].name;
            let lineRT = zone[property].lineRT.filter(function (element, index) {
                let dateToCheck = new Date(element.timeStamp)

                // get only a 24hour period
                // return (dateToCheck <= numberOfDays && dateToCheck > oneDay)
                // get all older than dateToCheck
                return (dateToCheck <= numberOfDays)



            });
            filteredArrays.push({ [name]: lineRT })
        }
    })
    //console.log(filteredArrays)
    return filteredArrays;
}
// filter reading by timeStamp
function filterDataByTimeStampOld(zonesArray) {
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
    console.log(filteredArrays)
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
