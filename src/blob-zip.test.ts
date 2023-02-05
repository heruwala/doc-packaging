import { BlobStorage } from './blob';
import { BlobZip } from './blob-zip';
import internal from 'stream';

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
        const blobs = [
            {
                documentName: '456.pdf',
                documentId: 'C123/MSPE/1674687951',
            },
            {
                documentName: '123.pdf',
                documentId: 'C123/MSXSCRIPT/1674687992',
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
