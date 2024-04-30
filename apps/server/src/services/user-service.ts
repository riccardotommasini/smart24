import { singleton } from 'tsyringe';
import { DatabaseService } from './database-service/database-service';
import { Document } from 'mongodb';
import crypto from 'crypto';
import { Request, Response, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import User from '../models/user';
import { StatusCodes } from 'http-status-codes';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    getMessage() {
        return 'Hello world! ';
    }

    pingDb(): Promise<Document> {
        return this.databaseService.client.db('admin').command({ ping: 1 });
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
    Params :
     - token : token of the user cuttently logged on the session
     - otherUserId : id of th user that the current one wants to mark as 'trusted'

    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"username":"momo","mail":"a@gmail.com","password":"azerty"}' http://localhost:3000/user/create?username=momo&mail=
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/trustUser
    */
    public user_trustUser_post : RequestHandler[] = [

        ((req: Request, res: Response) => {
            //unfold parameters
            // const token = (req as CustomRequest).token;
            const userId = '6630be9d130907c60efc462c';
            const otherUserId = req.body.otherUserId;

            //objects
            let user;

            //find user that is connected on the session
            User.findById(userId)
                .then(user => {
                    if (!user) {
                        console.log('User not found');
                        return;
                    }
                    //add the other user to the list of trusted users
                    user.trustedUsers.push(otherUserId);
                    console.log('Retrieved user : ' + user);

                    //save updates
                    return user.save();
                })
                .then(savedUser => {
                    console.log('User saved : ' + savedUser);
                })
                .catch(error => {
                    console.error('Error :', error);
                });
        })
    ];
}
