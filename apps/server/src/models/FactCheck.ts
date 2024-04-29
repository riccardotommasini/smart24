import { DateTime } from 'luxon';
import mongoose, { Schema } from 'mongoose';

const FactCheckSchema = new Schema({
    factCheckId: { type: Schema.Types.ObjectId },
    truth: { type: Boolean, required: true },
    date: { type: DateTime, required: true, default: DateTime.now() },
    comment: { type: String, required: false },
    publisher: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Export model
module.exports = mongoose.model('FactCheck', FactCheckSchema);
