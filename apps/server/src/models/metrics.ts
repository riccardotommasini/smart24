import mongoose, { Schema } from 'mongoose';

const MetricsSchema = new Schema({
    metricsId: { type: Schema.Types.ObjectId },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trusts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrusts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shares: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    factChecked: [{ type: Schema.Types.ObjectId, ref: 'FactCheck' }],
});

// Export model
module.exports = mongoose.model('Metrics', MetricsSchema);
