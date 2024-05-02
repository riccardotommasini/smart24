import mongoose, { Document, Types } from 'mongoose';
import { container } from 'tsyringe';
import { FactCheck, ICreateFactCheck } from '../../models/FactCheck';
import { IMetrics, Metrics } from '../../models/metrics';
import { IPost, Post } from '../../models/post';
import User, { IUser } from '../../models/user';
import { DatabaseService } from '../database-service/database-service';
import { FactCheckService } from './factCheck-service';

const DEFAULT_CREATE_FACTCHECK: ICreateFactCheck = {
    comment: 'This is my fact check!',
    grade: 1,
    postId: '123',
};

describe('FactCheckService', () => {
    let factCheckService: FactCheckService;
    let user: IUser & Document;
    let notAFactChecker: IUser & Document;
    let metrics: IMetrics & Document;
    let post: IPost & Document;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();
        factCheckService = container.resolve(FactCheckService);
        const username = 'fuckyou';
        const passwordHash = 'yoyoyoyo';
        user = new User({
            name: 'a',
            surname: 'b',
            username,
            mail: 'a@gmail.com',
            passwordHash,
            factChecker: 1,
            organization: 'le monde',
        });

        notAFactChecker = new User({
            name: 'toto',
            surname: 'toto',
            username: 'toto',
            mail: 'toto@yahoo.fr',
            passwordHash,
        });

        await user.save();
        await notAFactChecker.save();

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
    });

    it('should create', () => {
        expect(factCheckService).toBeDefined();
    });

    describe('createAssignFactCheck', () => {
        it('should create factCheck', async () => {
            const factCheck = await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            expect((await FactCheck.findById(factCheck._id))?.comment).toEqual(DEFAULT_CREATE_FACTCHECK.comment);
            expect((await FactCheck.findById(factCheck._id))?.grade).toEqual(DEFAULT_CREATE_FACTCHECK.grade);
            expect((await FactCheck.findById(factCheck._id))?.emittedBy).toEqual(user._id);
            expect((await FactCheck.findById(factCheck._id))?.postId).toEqual(post._id);
        });

        it('should create factCheck and add it in the metrics of the post', async () => {
            const factCheck = await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            expect((await Metrics.findById(metrics._id))?.nbFactChecks).toEqual(1);
            expect((await Metrics.findById(metrics._id))?.factChecks?.length).toEqual(1);
            expect((await Metrics.findById(metrics._id))?.factChecks[0]).toEqual(factCheck._id);
        });

        it('should create factCheck and update count of fact checks done by the user', async () => {
            await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            expect((await User.findById(user._id))?.nbFactChecked).toEqual(1);
        });

        it('should not create and assign if user does not exists', async () => {
            return expect(
                factCheckService.createAssignFactCheck(new Types.ObjectId().toString(), DEFAULT_CREATE_FACTCHECK),
            ).rejects.toBeDefined();
        });

        it('should not create and assign if post does not exists', async () => {
            DEFAULT_CREATE_FACTCHECK.postId = '123';
            return expect(
                factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK),
            ).rejects.toBeDefined();
        });

        it('should not create and assign if user is not a fact checker', async () => {
            return expect(
                factCheckService.createAssignFactCheck(notAFactChecker._id, DEFAULT_CREATE_FACTCHECK),
            ).rejects.toBeDefined();
        });

        it('should not create and assign if user has already fact checked the same post', async () => {
            await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            return expect(
                factCheckService.createAssignFactCheck(notAFactChecker._id, DEFAULT_CREATE_FACTCHECK),
            ).rejects.toBeDefined();
        });
    });

    describe('hasUserFactCheckedPost', () => {
        it('should return true if user has fact checked the post', async () => {
            await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            expect(await factCheckService.hasUserFactCheckedPost(user._id, post._id)).toBeTruthy();
        });

        it('should return false if user has not fact checked the post', async () => {
            await factCheckService.createAssignFactCheck(user._id, DEFAULT_CREATE_FACTCHECK);

            expect(await factCheckService.hasUserFactCheckedPost(notAFactChecker._id, post._id)).toBeFalsy();
        });
    });
});
