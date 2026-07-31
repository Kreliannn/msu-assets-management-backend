import mongoose, { Schema } from 'mongoose';


const BorrowSchema = new Schema({
    studentName : { type: String, required: true },
    studentd : { type: String, required: true },
    studentSection : { type: String, required: true },
    borrowDate : { type: String, required: true },
    borrowTime : { type: String, required: true },
    returnDate : { type: String, required: false },
    returnTime : { type: String, required: false },
    assetId : { type: String, required: true },
    assetName : { type: String, required: true },
    assetQr : { type: String, required: true },
    status : { type: String, required: true },
});

export default mongoose.model('Borrows', BorrowSchema)
