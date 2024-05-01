import { Result, ValidationError } from 'express-validator';

export class HttpException extends Error {
    constructor(
        public status: number,
        public message: string,
        public errors?: Result<ValidationError>,
    ) {
        super(message);
    }
}
