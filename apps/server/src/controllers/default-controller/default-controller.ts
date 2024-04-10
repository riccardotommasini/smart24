import { singleton } from 'tsyringe';
import { AbstractController } from '../abstract-controller';
import { Router } from 'express';
import { DefaultService } from '../../services/default-service/default-service';

@singleton()
export class DefaultController extends AbstractController {
    constructor(private readonly defaultService: DefaultService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.get('/', (req, res) => {
            res.send(this.defaultService.getMessage());
        });

        router.get('/db', async (req, res, next) => {
            try {
                await this.defaultService.pingDb();
                res.send('Connected to db!');
            } catch (e) {
                next(e);
            }
        });
    }
}
