import archiver from 'archiver';
import internal, { Readable } from 'stream';
import { BlobStorage } from './blob';
import { PDFDocument } from 'pdf-lib';

export class BlobZip {
    private readonly blobStorage: BlobStorage;
    public constructor(blobStorage: BlobStorage) {
        this.blobStorage = blobStorage;
    }

    public async zipBlobs(containerName: string, blobs: any[], zipName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            var isComplete = false;
            const archive = archiver('zip', {
                zlib: { level: 9 }, // Sets the compression level.
            });

            const output = new internal.PassThrough({
                allowHalfOpen: true,
                readableObjectMode: true,
                writableObjectMode: true,
            });

            this.blobStorage
                .writeStreamToBlob(zipName, containerName, output, 'application/zip')
                .then(() => {
                    console.log('writeStreamToBlob completed');
                    isComplete = true;
                    resolve();
                })
                .catch((err) => {
                    console.log('writeStreamToBlob failed', err);
                    isComplete = true;
                    reject(err);
                });

            archive.pipe(output);

            Promise.all(
                blobs.map((blob) => {
                    return this.blobStorage
                        .readStreamFromBlob(blob.documentId, containerName)
                        .then(async (documentStream) => {
                            // Merge PDFs
                            const readable = this.blobStorage.readStreamFromBlob('Cover.pdf', containerName);
                            const coverStream = internal.Readable.from(await readable);

                            return coverStream;
                        })
                        .then((blobStream) => {
                            archive.append(blobStream , { name: blob.documentName });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
            )
                .then(() => {
                    archive.finalize();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }
}