import mongoose, { Schema } from 'mongoose';


const TransferRequestSchema = new Schema({
    assetId : { type: String, required: true },
    assetname : { type: String, required: true },
    date : { type: String, required: true },
    college : { type: String, required: false },
    custodian : { type: String, required: false },
    status : { type: String, required: true },
});

export default mongoose.model('TransferRequests', TransferRequestSchema)