// invoke the following functions, a frankenstein method:
// get last runtime
// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API
// for a given case download files from blob storage having TransmissionStatus of "Pending" and CreateDate < current runtime
// Create a manifest file
// stream merging pdf (annotating pdf)
// stream zipping
// upload zip file to blob storage along with metadata of included fileNames, their docType, caseId, and CreateDate
// create a message to send to the queue
// send message to the queue
// update the blob storage with TransmissionStatus of "Transmitted"

import blobUtils from './blob';
import { getCases } from './case';
import { getLastRuntime } from './last-runtime';

export function documentPackage() {
    let success = false;
    try {
        const lastRuntime = getLastRuntime();
        const currentTime = Date.now();
        const cases = getCases(currentTime, lastRuntime);
        // for a given case download files from blob storage having TransmissionStatus of "Pending" and CreateDate < current runtime
        cases.forEach((caseItem) => {
            const blobList = blobUtils.getBlobList(caseItem.caseId);
            try {
                if (blobList.length > 0) {
                    blobList.forEach((blobItem) => {
                        const fileNames = blobList
                            .filter((blobItem) => blobItem.transmissionStatus === 'Pending' && blobItem.createDate < currentTime)
                            .map((blobItem) => blobItem.fileName);
                        const streams = blobUtils.downloadBlobFiles(fileNames);
                        // Create a manifest file
                        // stream merging pdf (annotating pdf)
                        // stream zipping
                        // upload zip file to blob storage along with metadata of included fileNames, their docType, caseId, and CreateDate
                        // create a message to send to the queue
                        // send message to the queue
                        // update the blob storage with TransmissionStatus of "Transmitted"
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
        success = true;
    } catch (error) {
        success = false;
        console.log(error);
    }
    return success;
}
