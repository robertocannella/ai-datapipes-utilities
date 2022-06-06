import mongoose from "mongoose";
import config from "config";

//Database setup
export const DATABASEUSERNAME = config.get('db.dbUser');
export const DATABASEPASSWORD = config.get('db.dbPass');
export const DATABASEHOST = config.get('db.dbHost');
export const DATABASEPORT = config.get('db.dbPort');
export const DATABASENAME = 'datapipes';
var connection;
// Connect to mongodb
function db() {
    let url = `mongodb://192.168.1.179:${DATABASEPORT}/${DATABASENAME}?replicaSet=rs0`;
    const cleanup = (event) => { // SIGINT is sent for example when you Ctrl+C a running process from the command line.
        console.log(event)
        mongoose.connection.close(); // Close MongodDB Connection when Process ends
        process.exit(); // Exit with default success-code '0'.
    }

    const connection = mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
        //useNewUrlParser: true,
        useUnifiedTopology: false,
        directConnection: true,
        authSource: "admin",
        user: DATABASEUSERNAME,
        pass: DATABASEPASSWORD
        //socketTimeoutMS: 10000
    }).then((event) => {
        //console.log(event);
        console.log('mongo connected');
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        // setTimeout(async () => {
        //     await mongoose.disconnect()
        //     process.exit();
        // }, 5000)
    }).catch(e => { console.log("\n ************   DB Connection Error: ************\n", e.reason); });
}



export { db, connection }

