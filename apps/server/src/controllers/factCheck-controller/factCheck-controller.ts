import { NextFunction, Response, Router } from 'express';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { FactCheckService } from '../../services/factCheck-service';
import { AbstractController } from '../abstract-controller';
import { AuthRequest, auth } from '../../middleware/auth';
import { ICreateFactCheck } from '../../models/FactCheck';

@singleton()
export class FactCheckerController extends AbstractController {
    constructor(private readonly factCheckService: FactCheckService) {
        super({ basePath: '/factCheck' });
    }

    protected configureRoutes(router: Router) {
        router.post(
            '/create',
            body('grade')
                .trim()
                .custom((value) => {
                    return [0, 1, 2].includes(Number(value));
                })
                .withMessage('`grade` must be 0, 1, or 2'),
            body('comment').trim().optional(),
            auth,
            async (req: AuthRequest<object, ICreateFactCheck>, res: Response, next: NextFunction) => {
                try {
                    res.status(StatusCodes.CREATED).send(
                        await this.factCheckService.createAssignFactCheck(req.user?.username ?? '', req.body),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
