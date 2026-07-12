import mongoose, { Schema } from 'mongoose';


const DisposalRecordtSchema = new Schema({
    proof : { type: String, required: true },
    assetname : { type: String, required: true },
    message : { type: String, required: true },
    date : { type: String, required: true },
    college : { type: String, required: true },
    recordedBy : { type: String, required: true },
});

export default mongoose.model('DisposalRecordts', DisposalRecordtSchema)