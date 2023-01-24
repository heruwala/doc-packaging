import blobUtils from "./blob";

describe ('blob', () => {
    it ('given caseId, return list of files from blob storage', () => {
        expect(blobUtils.getBlobList('123')).toEqual([
            {
                fileName: '123.pdf',
                contentType: 'application/pdf',
                docType: 'transcript',
                caseId: '123',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            },
            {
                fileName: '456.pdf',
                contentType: 'application/pdf',
                docType: 'transcript',
                caseId: '123',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            },
            {
                fileName: '789.jpeg',
                contentType: 'image/jpeg',
                docType: 'photo',
                caseId: '123',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            }
        ]);
    });

    it ('given fileNames, return list of streams', () => {
        blobUtils.downloadBlobFiles(['123.pdf', '456.pdf', '789.jpeg'])
          .then((streams) => {
            expect(streams[0].stream).not.toBeUndefined();
        });
    });
});