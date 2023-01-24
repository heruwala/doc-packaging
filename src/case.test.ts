// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API

import { getCases } from "./case";
import runtimeUtils from "./last-runtime";

describe('getCases', () => {
    it('given a current time and last runtime, return an array of cases', () => {
        const lastRuntime = runtimeUtils.getLastRuntime();
        const currentTime = new Date();
        expect(getCases(currentTime, lastRuntime)).toEqual([
            {
                caseId: 'C123',
                lastUploadDate: new Date('2023-01-24T18:29:12.621Z'),
                transcriptTransError: false,
                photoTransError: false            
            },
            {
                caseId: 'C456',
                lastUploadDate: new Date('2023-01-24T18:30:12.621Z'),
                transcriptTransError: false,
                photoTransError: false
            }
        ]);
    });
});