import mongoose, { Schema } from 'mongoose';

const NotifSchema = new Schema({
    type : { type: String, required: true },
    to : { type: String, required: false },
    description: { type: String, required: true },
    date: { type: String, required: true },
});

export default mongoose.model('Notifs', NotifSchema)
