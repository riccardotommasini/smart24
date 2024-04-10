import 'reflect-metadata';
import { container } from 'tsyringe';
import { Application } from './app';
import { env } from './utils/env';

(async () => {
    // eslint-disable-next-line no-console
    console.log(`⛰️ Environment: ${env.isDev ? '🔨 development' : '🏢 production'}`);

    const app = container.resolve(Application);

    await app.init();

    app.listen(env.PORT);
})();
