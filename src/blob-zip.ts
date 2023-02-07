import archiver from 'archiver';
import internal, { Readable } from 'stream';
import { BlobStorage } from './blob';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { annotatePdfDocuments1 } from './annotate';
import manifest from './manifest';

export class BlobZip {
    private readonly blobStorage: BlobStorage;
    public constructor(blobStorage: BlobStorage) {
        this.blobStorage = blobStorage;
    }

    public async zipBlobs(containerName: string, blobs: BlobData[], zipFileName: string, zipCreationDateTime: Date, aamcApplicationId: string, seasonId: string, caseId: string): Promise<void> {
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

            const tags: Record<string, string> = {
                aamcApplicationId: aamcApplicationId,
                seasonId: seasonId,
                caseId: caseId,
            };

            const metadata: Record<string, string> = {
                files: JSON.stringify(blobs.map((blobDocument) => blobDocument.documentId)),
            };

            const blobLocation = `${caseId}/aamc-transfer-packages/${zipFileName}`;

            this.blobStorage
                .writeStreamToBlob(blobLocation, containerName, output, 'application/zip', tags, metadata)
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

            // TODO: Generate Manifest
            //const zipCreationDateTime = new Date();
            //const aamcApplicationId = '1234567890'
            //const zipFileName = `${aamcApplicationId}_${zipCreationDateTime.toISOString().slice(0, -5).replace(/:/g, '')}.zip`;
            //const seasonId = '2024';

            const manifestFile = manifest.createManifestFile(zipFileName, zipCreationDateTime, aamcApplicationId, seasonId, blobs);

            Promise.all(                
                blobs.map((blob) => {
                    return this.blobStorage
                        .readStreamFromBlob(blob.documentId, containerName)
                        .then(async (documentStream) => {
                            if (blob.uploadedByType === 'midus') {
                                let coverPageStream: internal.Readable = fs.createReadStream(path.resolve(__dirname, './annotate/cover.pdf'));
                                const mergedStream = await annotatePdfDocuments1(coverPageStream, documentStream as internal.Readable);
                                return mergedStream;                            
                            } else {
                                return documentStream as internal.Readable;
                            }
                        })
                        .then((blobStream) => {
                            archive.append(blobStream , { name: blob.documentName! });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
            )
                .then(() => {
                    archive.append(manifestFile, { name: 'manifest.json' });
                    archive.finalize();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }
}