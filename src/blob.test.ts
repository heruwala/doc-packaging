import blobUtils from "./blob";

describe ('blob', () => {
    it ('given caseId, return list of files from blob storage', () => {
        expect(blobUtils.getBlobList('123')).toEqual([
            {
                fileName: '123.pdf',
                docType: 'transcript',
                caseId: '123',
                createDate: 1590000000000,
                transmissionStatus: 'Pending'
            },
            {
                fileName: '456.pdf',
                docType: 'transcript',
                caseId: '123',
                createDate: 1590000000000,
                transmissionStatus: 'Pending'
            },
            {
                fileName: '789.pdf',
                docType: 'photo',
                caseId: '123',
                createDate: 1590000000000,
                transmissionStatus: 'Pending'
            }
        ]);
    });

    it ('given fileNames, return list of streams', () => {
        blobUtils.downloadBlobFiles(['123.pdf', '456.pdf', '789.pdf'])
          .then((streams) => {
            expect(streams[0].stream).not.toBeUndefined();
        });
    });
});