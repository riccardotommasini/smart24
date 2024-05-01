import { container } from 'tsyringe';
import { DefaultService } from './default-service';
import { describe, beforeEach, it } from 'node:test';

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
