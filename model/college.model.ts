import mongoose, { Schema } from 'mongoose';


const CollegeSchema = new Schema({
    department: { type: String, required: true },
    custodian:{
        name :  { type: String, required: true },
        idNumber :  { type: String, required: true },
        email :  { type: String, required: true },
    },
    dean :{
        name :  { type: String, required: true },
        idNumber :  { type: String, required: true },
        email :  { type: String, required: true },
    },
});

export default mongoose.model('Colleges', CollegeSchema)