import { BlobStorage } from './blob';
import { BlobZip } from './blob-zip';

describe('When using blob-zip', () => {
    let blobStorage: BlobStorage;
    let blobZip: BlobZip;
    beforeEach(() => {
        // arrange
        const services = new Services();
        blobStorage = services.blobStorage;
        blobZip = new BlobZip(blobStorage);
    });

    test('zipping blobs should succeed', async () => {
        // arrange
        const containerName = 'season-2024';
        const blobs: BlobData[] = [
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
        ];

        const zipName = 'ab.zip';

        // act
        await blobZip.zipBlobs(containerName, blobs, zipName);

        // assert
        expect(true).toBe(true);
    });
});

export class Services {
    private _blobStorage: BlobStorage;

    constructor() {
        this._blobStorage = this.InitBlobStorage();
    }

    public get blobStorage(): BlobStorage {
        return this._blobStorage;
    }

    private tryGetEnvVar(envVar: string): string {
        const value = process.env[envVar];
        if (value === undefined) {
            throw new Error(`Environment variable ${envVar} is not set`);
        }
        return value;
    }

    private InitBlobStorage(): BlobStorage {
        const storageAccount = this.tryGetEnvVar('BLOB_ACCOUNT_NAME');
        const storageKey = this.tryGetEnvVar('BLOB_ACCOUNT_KEY');
        return new BlobStorage(storageAccount, storageKey);
    }
}
