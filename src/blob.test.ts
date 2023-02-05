import { BlobStorage } from './blob';
import internal from 'stream';

const performIntegrationTests = true;

const accountName = !performIntegrationTests ? 'account-name' : process.env['BLOB_ACCOUNT_NAME']!;
const accountKey = !performIntegrationTests ? 'account-key' : process.env['BLOB_ACCOUNT_KEY']!;
const containerName = !performIntegrationTests ? 'container-name' : process.env['BLOB_CONTAINER_NAME']!;

describe('blob', () => {
    let blobStorage: BlobStorage;
    beforeEach(() => (blobStorage = new BlobStorage(accountName, accountKey)));

    it.skip('given caseId, return list of files from blob storage', async () => {
        // arrange
        const searchCriteria = "@container = '" + containerName + "' AND caseId = 'C123' AND transmissionStatus = 'pending' AND createdDate < '2023-02-02T00:00:00.000Z'";
        // act
        const blobs = await blobStorage.findBlobsByTags(searchCriteria);
        // assert
        expect(blobs).toEqual([
            {
                caseId: 'C123',
                contentType: 'application/pdf',
                createdAt: new Date('2023-01-25T23:48:36.000Z'),
                documentId: 'C123/MSPE/1674687951',
                documentName: '456.pdf',
                documentType: 'MSPE',
                lastModifiedAt: new Date('2023-02-04T21:31:37.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'midus',
            },
            {
                caseId: 'C123',
                contentType: 'application/pdf',
                createdAt: new Date('2023-01-25T23:47:36.000Z'),
                documentId: 'C123/MSXSCRIPT/1674687992',
                documentName: '123.pdf',
                documentType: 'MSXSCRIPT',
                lastModifiedAt: new Date('2023-02-04T21:31:58.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'applicant',
            },
            {
                caseId: 'C123',
                contentType: 'image/jpeg',
                createdAt: new Date('2023-01-25T23:49:36.000Z'),
                documentId: 'C123/PHOTO/1674688000',
                documentName: '789.jpeg',
                documentType: 'PHOTO',
                lastModifiedAt: new Date('2023-02-04T21:31:21.000Z'),
                transmissionStatus: 'pending',
                uploadedByType: 'applicant',
            },
        ] as BlobData[]);
    });

    it.skip('given caseId, return list of files from blob storage', async () => {
        // arrange
        const searchCriteria = "@container = '" + containerName + "' AND caseId = 'C123' AND transmissionStatus = 'pending' AND createdDate < '2023-02-02T00:00:00.000Z'";
        // act
        const blobs = await blobStorage.findBlobsByTags(searchCriteria);
        // assert
        expect(blobs).toBeGreaterThan(0);
    });

    it('given tags, return list of files from blob storage', async () => {
        // arrange
        const searchCriteria = "@container = '" + containerName + "' AND caseId = 'C123' AND transmissionStatus = 'pending' AND createdDate < '2023-02-02T00:00:00.000Z'";
        // act
        const blobs = await blobStorage.findBlobsByTags(searchCriteria);
        // assert
        expect(blobs.length).toBeGreaterThan(0);
    });

    it('given wrong tags, return empty list of files from blob storage', async () => {
        // arrange
        const searchCriteria = "@container = '" + containerName + "' AND caseId = 'C456' AND transmissionStatus = 'pending' AND createdDate < '2023-02-02T00:00:00.000Z'";
        // act
        const blobs = await blobStorage.findBlobsByTags(searchCriteria);
        // assert
        expect(blobs.length).toEqual(0);
    });

    it('given blob name, return readable stream from blob', async () => {
        // arrange
        const blobName = 'C123/MSPE/1674687951';
        // act
        const stream = await blobStorage.readStreamFromBlob(blobName, containerName);
        // assert
        expect(stream).toBeDefined();
    });

    it('given readable stream, write the stream to blob storage', async () => {
        // arrange
        const blobName = 'C123/MSPE/1674687951';
        const readableStream: NodeJS.ReadableStream = await blobStorage.readStreamFromBlob(blobName, containerName);
        const tags: Record<string, string> = {
            aamcApplicationId: '20240001',
            seasonId: 'season-2024',
            caseId: 'C123',
        };

        const metadata: Record<string, string> = {
            files: '1',
        };

        // act
        const result = await blobStorage.writeStreamToBlob('test.pdf', containerName, readableStream as internal.Readable, 'application/pdf', tags, metadata);
        // assert
        expect(result.clientRequestId).toBeDefined();
        expect(result.errorCode).toBeUndefined();
    });

    it('given blob tags and metadata, update the blob', async () => {
        // arrange
        const blobName = 'C123/MSPE/1674687955';
        // act
        const result = await blobStorage.updateBlob(blobName, containerName, new Date());
        // assert
        expect(result).toEqual(true);
    });
});
