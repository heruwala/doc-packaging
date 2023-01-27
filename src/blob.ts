import { BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config';

// for given caseId get the list of files from blob storage
async function getBlobList(caseId: string): Promise<BlobData[]> {
    const blobStorageConnection = 'BLOB_CONNECTION_STRING';
    const containerName = process.env['BLOB_CONTAINER_NAME'] || '';
    const connectionString = process.env[blobStorageConnection];

    // check if connectionString is defined in environment variables else throw error
    if (!connectionString) {
        throw new Error(`Unknown storage account, ${blobStorageConnection} is not defined in environment variables`);
    }

    // get list of files from blob storage filtered by caseId, transmissionStatus, and createdDate (less than current date)
    let blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const currentDateTime = new Date();
    let blobList: BlobData[] = [];
    for await (const blob of containerClient.findBlobsByTags("caseId='" + caseId + "' and transmissionStatus='pending' and createdDate<'" + currentDateTime.toISOString() + "'")) {
        const blobProperties = await containerClient.getBlobClient(blob.name).getProperties();
        const blobTags = await containerClient.getBlobClient(blob.name).getTags();

        blobList.push({
            documentType: <DocumentType>blobTags.tags['documentType'],
            documentName: blobProperties.metadata?.documentname,
            caseId: blobTags.tags['caseId'],
            documentId: blob.name,
            contentType: blobProperties.contentType,
            createdAt: new Date(blobTags.tags['createdDate']),
            lastModifiedAt: new Date(blobProperties.lastModified!),
            transmissionStatus: blobTags.tags['transmissionStatus'],
        });
    }

    return blobList;
}

// download blob files from azure blob storage based on input fileNames parameter and return a list of streams
async function downloadBlobFiles(blobs: BlobData[]) {
    let streams: BlobData[] = [];
    for (let file of blobs) {
        const blobStorageConnection = 'BLOB_CONNECTION_STRING';
        const containerName = process.env['BLOB_CONTAINER_NAME'] || '';
        const connectionString = process.env[blobStorageConnection];

        // check if connectionString is defined in environment variables else throw error
        if (!connectionString) {
            throw new Error(`Unknown storage account, ${blobStorageConnection} is not defined in environment variables`);
        }

        // download file from blob storage
        let blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        let containerClient = blobServiceClient.getContainerClient(containerName);
        let blobClient = containerClient.getBlobClient(file.documentId);

        const downloadBlockBlobResponse = await blobClient.download();

        if (!downloadBlockBlobResponse) {
            throw new Error(`Unable to download file, ${file.documentId} from container, ${containerName}`);
        }

        const downloadStream = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        streams.push({
            documentType: file.documentType,
            documentName: file.documentName,
            caseId: file.caseId,
            documentId: file.documentId,
            createdAt: file.createdAt,
            transmissionStatus: file.transmissionStatus,
            lastModifiedAt: file.lastModifiedAt,
            contentType: file.contentType,
            documentContent: downloadStream,
        });
    }
    return streams;
}

async function streamToBuffer(readableStream: any) {
    return new Promise((resolve, reject) => {
        const chunks: any = [];
        readableStream.on('data', (data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

export default { getBlobList, downloadBlobFiles };
