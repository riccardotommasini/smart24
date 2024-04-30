import Metrics from '../models/metrics';
import { DatabaseService } from './database-service/database-service';

export const likePost = async (userId: string, postId: string) => {
    try {
        const updatedMetrics = await Metrics.find({ postId: postId }).updateOne({ $push: { likes: userId } });
        return updatedMetrics;
    } catch (error) {
        return error;
    }
};

export const dislikePost = async (userId: string, postId: string) => {
    try {
        const updatedMetrics = await Metrics.find({ postId: postId }).updateOne({ $push: { dislikes: userId } });
        return updatedMetrics;
    } catch (error) {
        return error;
    }
};

export const trustPost = async (userId: string, postId: string) => {
    try {
        const updatedMetrics = await Metrics.find({ postId: postId }).updateOne({ $push: { trusts: userId } });
        return updatedMetrics;
    } catch (error) {
        return error;
    }
};

export const distrustPost = async (userId: string, postId: string) => {
    try {
        const updatedMetrics = await Metrics.find({ postId: postId }).updateOne({ $push: { distrusts: userId } });
        return updatedMetrics;
    } catch (error) {
        return error;
    }
};


export class MetricsService {
    constructor(private readonly databaseService: DatabaseService) {}

    getMessage() {
        return 'Hello world! ';
    }
}