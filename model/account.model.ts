import mongoose, { Schema } from 'mongoose';

const AccountSchema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    dateCreated : { type: String, required: true },
    status : { type: String, required: true },
    college: { type: String, required: true },
    profile: { type: String, required: true },
    idNumber: { type: String, required: true },
    email: { type: String, required: true },
});


export default mongoose.model('Accounts', AccountSchema)