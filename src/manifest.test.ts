import manifest from './manifest';

describe('manifest', () => {
    it('should create a manifest file', () => {
        const zipFileName = '21147862_EFDO_2022-05-19T14_02_48.zip';
        const zipFileCreateDateTime = new Date();
        const applicationId = '2023463931';
        const seasonId = '2023';
        const documents = [
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
        ] as BlobData[];

        const regexMatchString = `<?xml version="1.0" encoding="UTF-8"`;
        const manifestFile = manifest.createManifestFile(zipFileName, zipFileCreateDateTime, applicationId, seasonId, documents);
        expect(manifestFile).toBeDefined();
        expect(manifestFile.toString()).toMatch(new RegExp(regexMatchString, 'g'));
    });
});
