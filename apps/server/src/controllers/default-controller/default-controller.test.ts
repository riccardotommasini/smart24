import express from 'express';
import request from 'supertest';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { StatusCodes } from 'http-status-codes';

describe('DefaultController', () => {
    let app: express.Application;

    beforeEach(() => {
        app = container.resolve(Application)['app'];
    });

    describe('GET /', () => {
        it('should return a message', async () => {
            return request(app)
                .get('/')
                .expect(StatusCodes.OK)
                .then((res) => expect(res.body).toBeTruthy());
        });
    });

    describe('GET /not-found', () => {
        it('should return a 404 error', async () => {
            return request(app).get('/not-found').expect(StatusCodes.NOT_FOUND);
        });
    });
});
