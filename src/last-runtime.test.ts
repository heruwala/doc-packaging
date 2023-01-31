import runtimeUtils from './last-runtime';

// get last runtime (assert the timestamp is greater than 1 hour from the current time)
describe('LastRuntime', () => {
    it('given no arguments, return a timestamp that is less than 1 hour from the current time', () => {
        const lastRuntime = runtimeUtils.getLastRuntime();
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
        expect(lastRuntime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
    });

    it('given current time, set the last runtime in the database', () => {
        const currentTime = Date.now();
        expect(runtimeUtils.setLastRuntime(currentTime)).toEqual(true);
    });
});
