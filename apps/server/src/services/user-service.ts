import { singleton } from 'tsyringe';
import { DatabaseService } from './database-service/database-service';
import User from '../models/user';
import Post from '../models/post';
import { StatusCodes } from 'http-status-codes';
import mongoose, { Schema, trusted } from 'mongoose';
import { DocumentDefinition } from 'mongoose';
import UserSchema, { IUser } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    public async login(user: DocumentDefinition<IUser>) {
        const foundUser = await UserSchema.findOne({ username: user.username });

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcrypt.compareSync(user.passwordHash, foundUser.passwordHash);
      
      if (isMatch) {
            const token = jwt.sign({ _id: foundUser._id?.toString(), name: foundUser.name }, env.SECRET_KEY, {
                expiresIn: '2 days',
            });

            return { user: { mail: foundUser.mail, username: foundUser.username }, token: token };
        } else {
            throw new Error('Password is not correct');
        }
    }

    public user_create_post: RequestHandler[] = [
        // Validate and sanitize fields.
        body('username', 'Username required').trim().isLength({ min: 1 }).escape(),
        body('mail', 'E-mail required').trim().isLength({ min: 1 }).escape(),
        body('password', 'Password required').trim().isLength({ min: 1 }).escape(),
        // Process request after validation and sanitization.

        asyncHandler(async (req: Request, res: Response) => {
            // Extract the validation errors from a request.
            const errors = validationResult(req);

            const passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
            
            // Create a Book object with escaped and trimmed data.
            const user = new User({
                username: req.body.username,
                mail: req.body.mail,
                passwordHash: passwordHash,
            });

            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/error messages.
            } else {
                // Data from form is valid. Save book.
                try {
                    await user.save();
                    res.status(StatusCodes.OK).send('user saved !!!');
                } catch (error) {
                    console.error(error);
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error saving user');
                }
            }
        }),
    ];

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"username":"momo","mail":"a@gmail.com","password":"azerty"}' http://localhost:3000/user/create
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/trustUser
    */

    async user_trustUser_post(userId : string, otherUserId: string) {
        
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id : userId, trustedUsers : { $ne : otherUserIdObject}},
                { $push : { trustedUsers : otherUserIdObject}}
            ),
            User.updateOne(
                { _id : userId},
                { $pull : { untrustedUsers : { $in : [otherUserIdObject]}}}
            )
        ])
    }

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"username":"momo","mail":"a@gmail.com","password":"azerty"}' http://localhost:3000/user/create
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/untrustUser
    */
    async user_untrustUser_post(userId : string, otherUserId: string) {
        
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id : userId, untrustedUsers : { $ne : otherUserIdObject}},
                { $push : { untrustedUsers : otherUserIdObject}}
            ),
            User.updateOne(
                { _id : userId},
                { $pull : { trustedUsers : { $in : [otherUserIdObject]}}}
            )
        ])
    }

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/visitUserProfile
    */
    async user_visitUserProfile_post(otherUserId: string) {

        console.log("enter visitUserProfile");

        let otherUserInfo = new User();
        let lastPostsByUser = [];
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        //retrieve data of other user
        User.findById(otherUserId)
            .then(foundUser => {
                if (!foundUser) {
                    return;
                }

                console.log("user found");
                otherUserInfo = foundUser;

                const pipeline : mongoose.PipelineStage[] = [
                    { $match : { createdBy : otherUserIdObject }},
                    { $sort : { date : -1 }},
                    { $limit : 50 }
                ];

                return Post.aggregate(pipeline);
            })
            .then( res => {
                    console.log("posts found : " + res);
                    if (!res) {
                        return;
                    }
                    lastPostsByUser = res;

                    //send response
                    let response = {
                        userData : otherUserInfo,
                        lastPosts : lastPostsByUser
                    };
            
                    console.log(response)
            
                    return response;
            });
      
    async saveUser(
        username: string,
        mail: string,
        password: string,
        name: string,
        surname: string,
        birthday: string,
        factChecker: boolean,
        organization: string,
    ) {
        if (!factChecker && organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be empty for non-fact-checkers');
        } else if (factChecker && !organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be provided for fact-checker');
        }

        const existingUser = await User.findOne({ $or: [{ username: username }, { mail: mail }] });
        if (existingUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or email already exists');
        }

        // const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        let birthdayDate: Date;
        if (birthday) {
            const [day, month, year] = birthday.split('/');
            birthdayDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
        const user = new User({
            username: username,
            mail: mail,
            passwordHash: password,
            name: name,
            surname: surname,
            birthday: birthdayDate!,
            factChecker: factChecker,
            organization: organization,
        });

        try {
            await user.save();
        } catch (error) {
            console.error(error);
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Error saving user');
        }
    }
}
