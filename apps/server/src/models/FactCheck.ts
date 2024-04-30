import { DateTime } from 'luxon';
import mongoose, { Schema } from 'mongoose';

const FactCheckSchema = new Schema({
    grade: { type: Number, required: true },
    date: { type: DateTime, required: true, default: DateTime.now() },
    comment: { type: String, required: false },
    emittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Export model
module.exports = mongoose.model('FactCheck', FactCheckSchema);
