import { registry } from 'tsyringe';
import { SYMBOLS } from '../constants/symbols';
import { DefaultController } from '../controllers/default-controller/default-controller';

@registry([{ token: SYMBOLS.controllers, useClass: DefaultController }])
export class ControllerRegistry {}
