import { Router } from 'express';
import { singleton } from 'tsyringe';
import { AbstractController } from './abstract-controller';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { body } from 'express-validator';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/user/create', async (req, res, next) => {
            try {
                await this.userService.saveUser(req.body.username, req.body.mail, req.body.password);
                res.status(StatusCodes.OK).send('Connected to db!');
            } catch (e) {
                next(e);
            }
        });
        router.post('/login', async (req, res, next) => {
            try {
                const foundUser = await this.userService.login(req.body);
                res.status(200).send(foundUser);
            } catch (error) {
                next(error);
            }
        });
    }
}
