import { AlgoService } from '../../services/algo-service/algo-service';
import { singleton } from 'tsyringe';
import { AbstractController } from '../abstract-controller';
import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { query, validationResult } from 'express-validator';
import { ALGO_SUGGESTION_TYPES, AlgoSuggestionType } from '../../algo/algo-suggestion/algo-suggestions-computer';

@singleton()
export class AlgoController extends AbstractController {
    constructor(private readonly algoService: AlgoService) {
        super({ basePath: '/algo' });
    }

    protected configureRoutes(router: Router): void {
        router.post('/', auth, query('type').default('default').isIn(ALGO_SUGGESTION_TYPES), async (req, res, next) => {
            try {
                const validErrors = validationResult(req);
                if (!validErrors.isEmpty()) {
                    throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', validErrors);
                }

                const errors = await this.algoService.computeForAll(req.query.type as AlgoSuggestionType);

                if (errors.length) {
                    next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, errors.map((e) => e.reason).join(', ')));
                } else {
                    res.status(StatusCodes.NO_CONTENT).send();
                }
            } catch (e) {
                next(e);
            }
        });

        router.post(
            '/:userId',
            auth,
            query('type').default('default').isIn(ALGO_SUGGESTION_TYPES),
            async (req, res, next) => {
                try {
                    const validErrors = validationResult(req);
                    if (!validErrors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', validErrors);
                    }

                    const errors = await this.algoService.computeForUser(
                        req.params.userId,
                        req.query.type as AlgoSuggestionType,
                    );

                    if (errors.length) {
                        next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, errors.join(', ')));
                    } else {
                        res.status(StatusCodes.NO_CONTENT).send();
                    }
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
