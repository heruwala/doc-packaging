// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API

import { getCases } from "./case";

describe('getCases', () => {
    it('given a current time and last runtime, return an array of cases', () => {
        const currentTime = 1590000000000;
        const lastRuntime = 1589990000000;
        expect(getCases(currentTime, lastRuntime)).toEqual([
            {
                caseId: '123',
                lastUploadDate: 1590000000000,
                transcriptTransError: false,
                photoTransError: false            
            },
            {
                caseId: '456',
                lastUploadDate: 1590000000000,
                transcriptTransError: false,
                photoTransError: false
            }
        ]);
    });
});