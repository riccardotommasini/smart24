import 'reflect-metadata';
import { container } from 'tsyringe';
import { DatabaseService } from '../src/services/database-service/database-service';
import { DatabaseTestingService } from '../src/services/database-service/database-testing-service';

container.registerInstance(DatabaseService, container.resolve(DatabaseTestingService));
