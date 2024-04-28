import express from 'express';
import cors from 'cors';
import { injectAll, singleton } from 'tsyringe';
import { HttpException } from './models/http-exception';
import { SYMBOLS } from './constants/symbols';
import { AbstractController } from './controllers/abstract-controller';
import './config/registry';
import { errorHandler } from './middleware/error-handler';
import { DatabaseService } from './services/database-service/database-service';

@singleton()
export class Application {
    private app: express.Application;

    constructor(
        @injectAll(SYMBOLS.controllers) private readonly controllers: AbstractController[],
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
        for (const controller of this.controllers) {
            controller.use(this.app);
        }

        this.app.use('**', (req, res, next) => {
            next(new HttpException(404, `${req.method} ${req.url} not found`));
        });

        this.app.use(errorHandler);
    }
}
