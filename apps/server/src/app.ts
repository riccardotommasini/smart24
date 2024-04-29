import express from 'express';
import cors from 'cors';
import { injectAll, singleton, inject } from 'tsyringe';
import { HttpException } from './models/http-exception';
import { SYMBOLS } from './constants/symbols';
import { AbstractController } from './controllers/abstract-controller';
import './config/registry';
import { errorHandler } from './middleware/error-handler';
import { DatabaseService } from './services/database-service/database-service';
import { DefaultController } from './controllers/default-controller/default-controller';
import { UserController } from './controllers/user-controller';

@singleton()
export class Application {
    private app: express.Application;

    constructor(
        @inject(SYMBOLS.defaultController) private defaultController: DefaultController,
        @inject(SYMBOLS.userController) private userController: UserController,
        private readonly databaseService: DatabaseService,
    ) {
        this.app = express();

        this.app.use(express.json());
        this.app.use(cors({ origin: '*' }));

        this.configureRoutes();
    }

    listen(port: number | string): void {
        this.app.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`🚀 Server up on port ${port} (http://localhost:${port})`);
        });
    }

    async init() {
        await this.databaseService.connect();
        // eslint-disable-next-line no-console
        console.log('🗃️ Connected to database');
    }

    private configureRoutes(): void {
        this.defaultController.use(this.app);
        this.userController.use(this.app);

        this.app.use('**', (req, res, next) => {
            next(new HttpException(404, `${req.method} ${req.url} not found`));
        });

        this.app.use(errorHandler);
    }
}
