import { singleton } from 'tsyringe';
import { Types, UpdateQuery } from 'mongoose';
import { Metrics, IMetrics } from '../models/metrics';

@singleton()
export class MetricsService {
    constructor() {}

    async updateMetrics(metricsId: string, update: UpdateQuery<IMetrics>): Promise<IMetrics | null> {
        const metricsObjectId = new Types.ObjectId(metricsId);
        const updatedMetrics = await Metrics.findByIdAndUpdate(metricsObjectId, update, { new: true });
        return updatedMetrics;
    }
}
