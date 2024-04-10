import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../models/http-exception';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { env } from '../utils/env';

interface ErrorResponse {
    message: string;
    error: string;
    stack?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

    const response: ErrorResponse = {
        message: error.message,
        error: getReasonPhrase(status),
    };

    res.locals.message = error.message;
    res.locals.error = env.isDev ? error : {};

    if (env.isDev) {
        response.stack = error.stack?.split('\n');
    }

    console.error(`${req.method} ${req.path} ${status}: ${error.name} - ${error.message}\n${error.stack}`);

    res.status(status).json(response);
}
