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
            this.userService.createUser.forEach((handler) => handler(req, res, next));
        });
    }
}



