import { Router, Application } from 'express';

export interface ControllerConfig {
    basePath: string;
}

const DEFAULT_CONFIG: ControllerConfig = {
    basePath: '/',
};

export abstract class AbstractController {
    private router: Router;
    private config: ControllerConfig;

    constructor(config: Partial<ControllerConfig> = {}) {
        this.router = Router();
        this.config = { ...DEFAULT_CONFIG, ...config };

        this.configureRoutes(this.router);
    }

    use(app: Application): void {
        app.use(this.config.basePath, this.router);
    }

    protected abstract configureRoutes(router: Router): void;
}
