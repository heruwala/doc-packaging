// invoke the following functions, a frankenstein method:
// get last runtime
// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API
// for a given case download files from blob storage having TransmissionStatus of "pending" and CreateDate < current runtime
// Create a manifest file
// annotate pdf only for MIDUS pdf
// zip documents and manifest XML
// upload zip file to blob storage along with metadata of included fileNames, their docType, caseId, and CreateDate
// create a message to send to the queue
// send message to the queue
// update the blob storage with TransmissionStatus of "Transmitted"
// set the last runtime to the current time

import { annotatePdfDocuments } from './annotate';
import blobUtils, { BlobStorage } from './blob';
import { getCases } from './case';
import runtimeUtils from './last-runtime';
import manifest from './manifest';
import { promises as fs } from 'fs';
import { zipFiles } from './zip';
import { Readable } from "stream";

export async function documentPackage() {
    let success = false;
    try {
        const lastRuntime = runtimeUtils.getLastRuntime();
        const currentRunTime: Date = new Date();
        const cases = getCases(currentRunTime, lastRuntime);
        const accountName = process.env['BLOB_ACCOUNT_NAME']!;
        const accountKey = process.env['BLOB_ACCOUNT_KEY']!;
        const containerName = process.env['BLOB_CONTAINER_NAME']!;
        for (const caseItem of cases) {
            const aamcApplicationId = caseItem.aamcApplicationId;
            const seasonId = caseItem.seasonId;
            const caseId = caseItem.caseId;
            const miducCoverPage = await fs.readFile('./annotations/MIDUS Cover.pdf');
            let manifestFile: Buffer;
            const blobStorage: BlobStorage = new BlobStorage(accountName, accountKey);
            try {
                const searchCriteria =
                    "@container = '" + containerName +
                    "' AND caseId = '" + caseId +
                    "' AND transmissionStatus = 'pending' AND createdDate < '" + currentRunTime.toISOString() + "'";
                    const blobList = await blobStorage.findBlobsByTags(searchCriteria);
                if (blobList.length > 0) {
                    const blobDocuments = await blobUtils.downloadBlobFiles(blobList);
                    const zipCreationDateTime = new Date();
                    const zipFileName = `${aamcApplicationId}_${zipCreationDateTime.toISOString().slice(0, -5).replace(/:/g, '')}.zip`;
                    manifestFile = manifest.createManifestFile(zipFileName, zipCreationDateTime, aamcApplicationId, seasonId, blobDocuments);
                    for (let document of blobDocuments) {
                        if (document.contentType === 'application/pdf' && document.uploadedByType === 'midus') {
                            const annotatedPdfBuffer = await annotatePdfDocuments([miducCoverPage, document.documentContent]);
                            document.documentContent = annotatedPdfBuffer;
                        }
                    }

                    const documentsToZip = blobDocuments.map((blobDocument) => {
                        return {
                            documentName: blobDocument.documentName,
                            documentContent: blobDocument.documentContent,
                        };
                    });
                    documentsToZip.push({
                        documentName: 'manifest.xml',
                        documentContent: manifestFile,
                    });
                    const zipFile = await zipFiles(documentsToZip);

                    // for verification purpose, write zip file to disk
                    //const zipFilePath = `./test/fixtures/${zipFileName}`;
                    //await fs.writeFile(zipFilePath, zipFile);

                    const tags: Record<string, string> = {
                        aamcApplicationId: aamcApplicationId,
                        seasonId: seasonId,
                        caseId: caseItem.caseId,
                    };

                    const metadata: Record<string, string> = {
                        files: JSON.stringify(blobDocuments.map((blobDocument) => blobDocument.documentId)),
                    };

                    const zipFileReadableStream = bufferToReadable(zipFile);
                    const blobLocation = `${caseId}/aamc-transfer-packages/${zipFileName}`;
                    const blobUploadResponse = await blobStorage.writeStreamToBlob(blobLocation, containerName, zipFileReadableStream, 'application/zip', tags, metadata);

                    // create a message to send to the queue
                    // send message to the queue and get transmission date time
                    // update the blob storage with TransmissionStatus of "Transmitted" and TransmissionDate of current time
                    //for (let document of blobDocuments) {
                    //    await blobStorage.updateBlob(document.documentId, containerName, transmissionDateTime);
                    //}
                    // setLastRuntime(currentTime);
                }
            } catch (error) {
                // Log error and move on to the next case
                console.log(error);
            }
        }
        success = true;
    } catch (error) {
        success = false;
        console.log(error);
    }
    return success;
}

// Temporary code, once integrated with the stream, this will be removed
function bufferToReadable(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }