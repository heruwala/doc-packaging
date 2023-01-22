import { documentPackage } from './index';

// Unit test for the following functions, a frankenstein test:
// get last runtime (assert the timestamp is equal to the current time - 1 hour)
// get cases with LastUploadDate between current and last runtime, and (TranscriptTransError = false or PhotoTransError = false) from an API
// for a given case download files from blob storage having TransmissionStatus of "Pending" and CreateDate < current runtime
// Create a manifest file
// stream merging pdf (annotating pdf)
// stream zipping
// upload zip file to blob storage along with metadata of included fileNames, their docType, caseId, and CreateDate
// create a message to send to the queue
// send message to the queue
// update the blob storage with TransmissionStatus of "Transmitted"

describe('document package', () => {
    it('given all the methods, return success', () => {
        expect(documentPackage()).toBe(true);
    });
});