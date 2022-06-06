import mongoose from 'mongoose';


// create model for our objects to store in mongo db
// compile object into mongoose
export const System = mongoose.model('System', new mongoose.Schema(
    {

        _id: { type: String },
        outdoorTemps: { type: Array },
        ownerId: { type: String },
        systemDetails: {
            description: { type: String },
            equipmentId: { type: String }
        },
        zone10: { lineRT: [], lineST: [] },
        zone11: { lineRT: [], lineST: [] },
        zone12: { lineRT: [], lineST: [] }

    })
);
