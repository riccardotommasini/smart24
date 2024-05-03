import { AlgoService } from '../../services/algo-service/algo-service';
import { singleton } from 'tsyringe';
import { AbstractController } from '../abstract-controller';
import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { query } from 'express-validator';
import { ALGO_SUGGESTION_TYPES, AlgoSuggestionType } from '../../algo/algo-suggestion/algo-suggestions-computer';

@singleton()
export class AlgoController extends AbstractController {
    constructor(private readonly algoService: AlgoService) {
        super({ basePath: '/algo' });
    }

    protected configureRoutes(router: Router): void {
        router.post('/', auth, query('type').isIn(ALGO_SUGGESTION_TYPES).default('default'), async (req, res, next) => {
            const errors = await this.algoService.computeForAll(req.query.type as AlgoSuggestionType);

            if (errors.length) {
                next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, errors.map((e) => e.reason).join(', ')));
            } else {
                res.status(StatusCodes.NO_CONTENT).send();
            }
        });

        router.post(
            '/:userId',
            auth,
            query('type').isIn(ALGO_SUGGESTION_TYPES).default('default'),
            async (req, res, next) => {
                const errors = await this.algoService.computeForUser(
                    req.params.userId,
                    req.query.type as AlgoSuggestionType,
                );

                if (errors.length) {
                    next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, errors.join(', ')));
                } else {
                    res.status(StatusCodes.NO_CONTENT).send();
                }
            },
        );
    }
}
