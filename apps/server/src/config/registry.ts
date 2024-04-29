import { registry } from 'tsyringe';
import { SYMBOLS } from '../constants/symbols';
import { DefaultController } from '../controllers/default-controller/default-controller';
import { UserController } from '../controllers/user-controller';

@registry([
    { token: SYMBOLS.defaultController, useClass: DefaultController },
    { token: SYMBOLS.userController, useClass: UserController },
])
export class ControllerRegistry {}
