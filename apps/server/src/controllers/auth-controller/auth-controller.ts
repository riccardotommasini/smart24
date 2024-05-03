import { AuthService } from '../../services/auth-service/auth-service';
import { AbstractController } from '../abstract-controller';
import { Request, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { IUserCreation } from '../../models/user';
import { singleton } from 'tsyringe';
import { AuthRequest, auth } from '../../middleware/auth';

@singleton()
export class AuthController extends AbstractController {
    constructor(private readonly authService: AuthService) {
        super();
    }

    protected configureRoutes(router: Router): void {
        router.post(
            '/login',
            body('username', 'is required').trim().isLength({ min: 1 }),
            body('password', 'is required').trim().isLength({ min: 1 }),
            async (req: Request<object, object, { username: string; password: string }>, res, next) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    res.status(StatusCodes.OK).send(await this.authService.login(req.body.username, req.body.password));
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/signup',
            body('name', 'is required').trim().notEmpty(),
            body('surname', 'is required').trim().notEmpty(),
            body('username', 'is required').trim().notEmpty(),
            body('mail', 'is required').trim().notEmpty(),
            body('mail', 'must be a valid email').isEmail(),
            body('password', '`password` of length >=5 is required').trim().isLength({ min: 5 }),
            body('birthday', '`birthday` must be a valid date').isISO8601().toDate().optional(),
            async (req: Request<object, object, IUserCreation>, res, next) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    res.status(StatusCodes.CREATED).send(
                        await this.authService.signup({
                            username: req.body.username,
                            mail: req.body.mail,
                            password: req.body.password,
                            name: req.body.name,
                            surname: req.body.surname,
                            birthday: req.body.birthday,
                            factChecker: req.body.factChecker,
                            organization: req.body.organization,
                        }),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post('/loadSession', auth, async (req: AuthRequest, res) => {
            res.status(StatusCodes.OK).send(req.user);
        });
    }
}
