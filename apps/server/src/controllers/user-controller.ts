import { Router } from 'express';
import { singleton } from 'tsyringe';
import { AbstractController } from './abstract-controller';
import { UserService } from '../services/user-service';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/user/create', (req, res, next) => {
            this.userService.user_create_post.forEach((handler) => handler(req, res, next));
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
