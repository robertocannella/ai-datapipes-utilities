import * as fs from 'fs';
import { afs } from './services/firestore.js'
import path from 'path';
import { Utils } from './utlis/utils.js';

// 1)  Handle [args] here ****************************

// Checks for --sysID and if it has a value
const systemIdIndex = process.argv.indexOf('--sysId');
let systemId;

if (systemIdIndex > -1) {
    // Retrieve the value after --custom
    systemId = process.argv[systemIdIndex + 1];
}

// Checks for --sensID and if it has a value
const sensorIdIndex = process.argv.indexOf('--sensId');
let sensorId;

if (sensorIdIndex > -1) {
    // Retrieve the value after --sensId
    sensorId = process.argv[sensorIdIndex + 1];
}

if (!systemId || !sensorId) {
    console.error("SystemID & SensorID Required \n Process Exiting \n Try Again...")
    process.exit();
}


console.log('SystemId:', `${systemId}`);
console.log('SensorId:', `${sensorId}`);


// 2a) Set or Create a Directory name: SYSTEM_ID-SENSOR_ID-YEAR-MONTH-DAY

const currentDay = new Date()
const daysAgo = Utils.getDaysAgo(currentDay, 3)
const YEAR = daysAgo.getFullYear();
const MONTH = daysAgo.getMonth() + 1;
const DAY = daysAgo.getDay();
let localPath = `${systemId}/${sensorId}/${YEAR}/${MONTH}`


// 2b check or set the path

let splits = localPath.split(/[\\\/]/);
var len = splits.length;  //<-- use var here to get value, not reference
for (let i = 0; i < len; i++) {
    if (fs.existsSync(splits[i])) {
        continue;
    }
    fs.mkdirSync(splits[i]);
    splits[i + 1] = splits[i] + '/' + splits[i + 1]
}

// 2c) Create file
fs.writeFile(`${localPath}/${DAY}.csv`, "test", (err) => { if (err) console.log(err) });


// 3) Get Firestore Data for selected SYSTEM_ID-SENSOR_ID-YEAR-MONTH-DAY

// 4) Create a file to store the data into

// 5) Write the file

// 5) Cleanup all utils

