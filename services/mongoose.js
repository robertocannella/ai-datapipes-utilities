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
    let url = `mongodb://${DATABASEHOST}:${DATABASEPORT}/${DATABASENAME}`;

    connection = mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
        //useNewUrlParser: true,
        useUnifiedTopology: false,
        //directConnection: true,
        authSource: "admin",
        user: DATABASEUSERNAME,
        pass: DATABASEPASSWORD
    }).then(() => {
        console.log('mongo connected');
    }).catch(e => { console.log("DB Connection Error: ", e.reason); });
}

export { db, connection }

