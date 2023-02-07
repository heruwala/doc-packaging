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

import { BlobStorage } from './blob';
import { getCases } from './case';
import runtimeUtils from './last-runtime';
import { BlobZip } from './blob-zip';

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

            const blobStorage: BlobStorage = new BlobStorage(accountName, accountKey);
            try {
                const searchCriteria =
                    "@container = '" +
                    containerName +
                    "' AND caseId = '" +
                    caseId +
                    "' AND transmissionStatus = 'pending' AND createdDate < '" +
                    currentRunTime.toISOString() +
                    "'";
                const blobList = await blobStorage.findBlobsByTags(searchCriteria);
                if (blobList.length > 0) {
                    const zipCreationDateTime = new Date();
                    const zipFileName = `${aamcApplicationId}_${zipCreationDateTime.toISOString().slice(0, -5).replace(/:/g, '')}.zip`;

                    const blobZip: BlobZip = new BlobZip(blobStorage);
                    await blobZip.zipBlobs(containerName, blobList, zipFileName, zipCreationDateTime, aamcApplicationId, seasonId, caseId);

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
