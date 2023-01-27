import blobUtils from './blob';

describe('blob', () => {
    it('given caseId, return list of files from blob storage', async () => {
        const newLocal = await blobUtils.getBlobList('C123');
        expect(newLocal).toEqual([
            {
                documentType: 'MSPE',
                documentName: '456.pdf',                
                caseId: 'C123',
                documentId: 'C123/MSPE/1674687951',
                contentType: 'application/pdf',                
                createdAt: new Date('2023-01-25T23:48:36.000Z'),
                lastModifiedAt: new Date('2023-01-26T01:04:07.000Z'),
                transmissionStatus: 'pending'                
            },
            {
                documentType: 'MSXSCRIPT',
                documentName: '123.pdf',                
                caseId: 'C123',
                documentId: 'C123/MSXSCRIPT/1674687992',
                contentType: 'application/pdf',
                createdAt: new Date('2023-01-25T23:47:36.000Z'),
                lastModifiedAt: new Date('2023-01-26T00:43:42.000Z'),
                transmissionStatus: 'pending'                
            },            
            {
                documentType: 'PHOTO',
                documentName: '789.jpeg',                
                caseId: 'C123',
                documentId: 'C123/PHOTO/1674688000',
                contentType: 'image/jpeg',           
                createdAt: new Date('2023-01-25T23:49:36.000Z'),
                lastModifiedAt: new Date('2023-01-26T01:10:15.000Z'),
                transmissionStatus: 'pending'
            }
        ] as BlobData[]);
    });

    it('given fileNames, return list of streams', async () => {
        blobUtils.downloadBlobFiles(await blobUtils.getBlobList('C123')).then((streams) => {
            expect(streams[0].documentContent).not.toBeUndefined();
        });
    });
});
