// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API

import { getCases } from "./case";
import runtimeUtils from "./last-runtime";

describe('getCases', () => {
    it('given a current time and last runtime, return an array of cases', () => {
        const lastRuntime = runtimeUtils.getLastRuntime();
        const currentTime = new Date();
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