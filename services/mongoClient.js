import { MongoClient } from "mongodb";
import config from "config";

//Database env variables
export const DATABASE_USERNAME = config.get('db.dbUser');
export const DATABASE_PASSWORD = config.get('db.dbPass');
export const DATABASE_HOST = config.get('db.dbHost');
export const DATABASE_PORT = config.get('db.dbPort');
export const DATABASE_NAME = 'datapipes';
const uri =
    `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}`;


// Create a new MongoClient
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    //useNewUrlParser: true,
    replicaSet: "rs0",
    useUnifiedTopology: false,
    directConnection: true,
    authSource: "admin"
});
async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Establish and verify connection
        await client.db("admin").command({ ping: 1 });
        console.log("Connected successfully to server");
        const collection = client.db("datapipes").collection('outdoortemps');
        const changeStream = collection.watch();

        changeStream.on('change', async (next) => {

            //console.log("change event occured", next)
            console.log("change event occured", next)
        });

    } catch (err) {
        console.log(err)
    }
    // finally {
    //     await client.close();
    //     console.log('disconnected')
    // }
}
run().catch(console.dir);