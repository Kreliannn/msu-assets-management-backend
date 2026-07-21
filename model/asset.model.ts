import mongoose, { Schema } from 'mongoose';


const AssetSchema = new Schema({
    name: { type: String, required: true },
    qr : { type: String, required: true },
    date: { type: String, required: true },
    value : { type: Number, required: true },
    category : { type: String, required: true },
    location: { type: String, required: false },
    condition : { type: String, required: true },
    status : { type: String, required: true },
    custodian :  { type: String, required: false },
    assignTo :  { type: String, required: false },
});

export default mongoose.model('Assets', AssetSchema)