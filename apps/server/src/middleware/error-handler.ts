import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../models/http-exception';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { env } from '../utils/env';
import { FieldValidationError, ValidationError } from 'express-validator';

interface ErrorResponse {
    message: string;
    error: string;
    reasons?: string[];
    stack?: string[];
}

const formatFieldError = (error: FieldValidationError | FieldValidationError[]): string[] => {
    if (Array.isArray(error)) {
        return error.map((e) => formatFieldError(e)[0]);
    }

    return [`${error.path}: ${error.msg} (current value: \`${error.value}\`)`];
};

const formatError = (error: ValidationError) => {
    if ('nestedErrors' in error) {
        return `${error.msg}: \n${error.nestedErrors.map(formatFieldError).join('\n')}`;
    } else if ('path' in error) {
        return formatFieldError(error).join('\n');
    } else {
        return error.msg;
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
    let message = error.message;
    let reasons: string[] | undefined;

    if (error instanceof HttpException && error.errors) {
        message +=
            ': ' +
            error.errors
                .formatWith(({ msg }) => msg)
                .array()
                .join(', ');
        reasons = error.errors.array().map(formatError);
    }

    const response: ErrorResponse = {
        message,
        error: getReasonPhrase(status),
        reasons,
    };

    res.locals.message = message;
    res.locals.error = env.isDev ? error : {};

    if (env.isDev) {
        response.stack = error.stack?.split('\n');
    }

    console.error(
        `${req.method} ${req.path} ${status}: ${error.name} - ${error.message}${reasons ? '\n' + reasons.map((reason) => `\t${reason}\n`) : ''}\n${error.stack}`,
    );

    res.status(status).json(response);
}
