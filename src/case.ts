// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API

export function getCases(currentTime: Date, lastRuntime: Date): CaseData[] {
    let cases: CaseData[] = [
        {
            caseId: 'C123',
            applicationId: '2023463931',
            seasonId: '2023',
            lastUploadDate: new Date('2023-01-24T18:29:12.621Z'),
            transcriptTransError: false,
            photoTransError: false,
        },
        {
            caseId: 'C456',
            applicationId: '2023463932',
            seasonId: '2023',
            lastUploadDate: new Date('2023-01-24T18:30:12.621Z'),
            transcriptTransError: false,
            photoTransError: false,
        },
    ];
    return cases;
}
