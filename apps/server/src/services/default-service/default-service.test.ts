import { container } from 'tsyringe';
import { DefaultService } from './default-service';

describe('DefaultService', () => {
    let defaultService: DefaultService;

    beforeEach(() => {
        defaultService = container.resolve(DefaultService);
    });

    describe('getMessage', () => {
        it('should return the correct message', () => {
            expect(defaultService.getMessage()).toBe('Hello world!');
        });
    });
});
