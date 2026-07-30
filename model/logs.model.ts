import mongoose, { Schema } from 'mongoose';

const LogSchema = new Schema({
    type: { type: String, enum: ["create", "update", "delete", "others"], required: true },
    entity: { type: String, required: false },
    entityId: { type: String, required: false },
    performedBy: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
});

export default mongoose.model('Logs', LogSchema)
