// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API

export function getCases(currentTime: number, lastRuntime: number) {
    return [
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
    ];
}
