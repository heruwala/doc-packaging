import blobUtils from "./blob";

describe ('blob', () => {
    it ('given caseId, return list of files from blob storage', () => {
        expect(blobUtils.getBlobList('123')).toEqual([
            {
                fileName: '123.pdf',
                contentType: 'application/pdf',
                docType: 'MSXSCRIPT',
                caseId: '123',
                documentId: 'D123',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            },
            {
                fileName: '456.pdf',
                contentType: 'application/pdf',
                docType: 'MSPE',
                caseId: '123',
                documentId: 'D456',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            },
            {
                fileName: '789.jpeg',
                contentType: 'image/jpeg',
                docType: 'PHOTO',
                caseId: '123',
                documentId: 'D789',
                createDate: new Date('2023-01-24T18:29:12.621Z'),
                lastModified: new Date('2023-01-24T18:29:12.621Z'),
                transmissionStatus: 'Pending'
            }
        ]);
    });

    it ('given fileNames, return list of streams', () => {
        blobUtils.downloadBlobFiles(blobUtils.getBlobList('123'))
          .then((streams) => {
            expect(streams[0].fileContent).not.toBeUndefined();
        });
    });
});