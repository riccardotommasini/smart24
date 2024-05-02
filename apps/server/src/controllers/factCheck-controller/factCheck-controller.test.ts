import { StatusCodes } from 'http-status-codes';
import mongoose, { Document } from 'mongoose';
import sinon from 'sinon';
import request from 'supertest';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { ICreateFactCheck } from '../../models/FactCheck';
import User, { IUser } from '../../models/user';
import { Post, IPost } from '../../models/post';
import { Metrics, IMetrics } from '../../models/metrics';
import { AuthService } from '../../services/auth-service/auth-service';
import { FactCheckService } from '../../services/factCheck-service/factCheck-service';

const DEFAULT_CREATE_FACTCHECK: ICreateFactCheck = {
    comment: 'This is my fact check!',
    grade: 1,
    postId: '123',
};

describe('FactCheckController', () => {
    let app: Application;
    let factCheckService: FactCheckService;
    let user: IUser & Document;
    let token: string;
    let metrics: IMetrics & Document;
    let post: IPost & Document;

    beforeEach(async () => {
        app = container.resolve(Application);
        factCheckService = container.resolve(FactCheckService);

        await app.init();
    });

    beforeEach(async () => {
        const username = 'fuckyou';
        const passwordHash = 'yoyoyoyo';
        user = new User({
            name: 'coucou',
            surname: 'toto',
            username,
            mail: 'a@gmail.com',
            passwordHash,
            factChecker: 1,
            organization: 'le monde',
        });

        await user.save();

        token = (await container.resolve(AuthService).login(username, passwordHash)).token;

        metrics = new Metrics({});
        await metrics.save();

        post = new Post({
            text: 'je suis un post',
            createdBy: user._id,
            metrics: metrics._id,
        });
        await post.save();

        DEFAULT_CREATE_FACTCHECK.postId = post._id.toString();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        sinon.restore();
    });

    describe('POST /post', () => {
        it('should call createAssignFactCheck', () => {
            const mock = sinon.mock(factCheckService);
            mock.expects('createAssignFactCheck').once();
            return request(app['app'])
                .post('/factCheck/create')
                .send(DEFAULT_CREATE_FACTCHECK)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then(() => mock.verify());
        });

        it('should not create if body has no grade', () => {
            sinon.mock(factCheckService);

            return request(app['app'])
                .post('/factCheck/create')
                .send({})
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
});
