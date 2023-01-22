import { multiply } from './multiply';

describe('multiply', () => {
    it('given numbers a and b, return a * b', () => {
        expect(multiply(1, 2)).toBe(2);
    });
});