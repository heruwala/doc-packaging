import blobUtils, { BlobStorage } from './blob';

const performIntegrationTests = true;

const accountName = !performIntegrationTests ? 'account-name' : process.env['BLOB_ACCOUNT_NAME']!;
const accountKey = !performIntegrationTests ? 'account-key' : process.env['BLOB_ACCOUNT_KEY']!;

describe('blob', () => {
    let blobStorage: BlobStorage;
    beforeEach(() => (blobStorage = new BlobStorage(accountName, accountKey)));

    it('given caseId, return list of files from blob storage', async () => {
        const blobs = await blobUtils.getBlobList('C123');
        expect(blobs).toEqual([
            {
                caseId: 'C123',
                contentType: 'application/pdf',
                createdAt: new Date('2023-01-25T23:47:36.000Z'),
                documentId: 'C123/MSXSCRIPT/1674687992',
                documentName: '123.pdf',
                documentType: 'MSXSCRIPT',
                lastModifiedAt: new Date('2023-02-01T18:20:15.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'applicant',
            },
            {
                caseId: 'C123',
                contentType: 'application/pdf',
                createdAt: new Date('2023-01-25T23:48:36.000Z'),
                documentId: 'C123/MSPE/1674687951',
                documentName: '456.pdf',
                documentType: 'MSPE',
                lastModifiedAt: new Date('2023-02-01T18:12:01.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'midus',
            },
            {
                caseId: 'C123',
                contentType: 'image/jpeg',
                createdAt: new Date('2023-01-25T23:49:36.000Z'),
                documentId: 'C123/PHOTO/1674688000',
                documentName: '789.jpeg',
                documentType: 'PHOTO',
                lastModifiedAt: new Date('2023-02-01T18:19:37.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'applicant',
            },
        ] as BlobData[]);
    });

    it('given tags, return list of files from blob storage', async () => {
        // arrange
        const searchCriteria = "@container = 'season-2024' AND caseId = 'C123' AND transmissionStatus = 'pending' AND createdDate < '2023-02-02T00:00:00.000Z'";
        // act
        const blobs = await blobStorage.findBlobsByTags(searchCriteria);
        // assert
        expect(blobs.length).toBeGreaterThan(0);
    });

    it('given fileNames, return list of streams', async () => {
        blobUtils.downloadBlobFiles(await blobUtils.getBlobList('C123')).then((streams) => {
            expect(streams[0].documentContent).not.toBeUndefined();
        });
    });
});
