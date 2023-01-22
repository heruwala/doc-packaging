import { getLastRuntime } from './last-runtime';

// get last runtime (assert the timestamp is greater than 1 hour from the current time)
describe('getLastRuntime', () => {
    it('given no arguments, return a timestamp that is greater than 1 hour from the current time', () => {
        expect(getLastRuntime()).toBeGreaterThan(3600000);
    });
});