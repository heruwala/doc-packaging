import { BlobServiceClient, BlobUploadCommonResponse } from '@azure/storage-blob';
import 'dotenv/config';
import internal from 'stream';
import { BlobActions, FileInfo } from './blob-actions';

export interface IBlobStorage {
    listBlobs(containerName: string, path?: string): Promise<FileInfo[]>;
    writeStreamToBlob(blobName: string, containerName: string, stream: internal.Readable, contentType: string): Promise<BlobUploadCommonResponse>;
    readStreamFromBlob(blobName: string, containerName: string): Promise<NodeJS.ReadableStream>;
}

export class BlobStorage implements IBlobStorage {
    private readonly accountName: string;
    private readonly accountKey: string;

    constructor(accountName: string, accountKey: string) {
        this.accountName = accountName;
        this.accountKey = accountKey;
    }

    /**
     * Lists all blobs in a storage account filtered by a tag query
     * @param tagQuery The tag query to filter the blobs
     * query syntax: https://docs.microsoft.com/en-us/rest/api/storageservices/find-blobs-by-tags#query-syntax
     * */
    public findBlobsByTags(tagQuery: string): Promise<FileInfo[]> {
        return new BlobActions(this.accountName, this.accountKey).findBlobsByTags(tagQuery);
    }

    /**
     * Lists all blobs in a container filtered by a path
     * @param containerName The name of the container to list
     * @param path (optional) prefix of the full blob name to filter the blobs in the container
     * full details: https://docs.microsoft.com/en-us/rest/api/storageservices/list-blobs
     * */
    public listBlobs(containerName: string, prefix?: string): Promise<FileInfo[]> {
        return new BlobActions(this.accountName, this.accountKey).listBlobs(containerName, prefix);
    }

    public async writeStreamToBlob(blobName: string, containerName: string, stream: internal.Readable, contentType: string): Promise<BlobUploadCommonResponse> {
        return new BlobActions(this.accountName, this.accountKey).writeStreamToBlob(blobName, containerName, stream, contentType);
    }

    public async readStreamFromBlob(blobName: string, containerName: string): Promise<NodeJS.ReadableStream> {
        const something = await new BlobActions(this.accountName, this.accountKey).readStreamFromBlob(blobName, containerName);
        return something.readableStreamBody!;
    }
}

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
            documentName: blobProperties.metadata?.document_name,
            caseId: blobTags.tags['caseId'],
            documentId: blob.name,
            contentType: blobProperties.contentType,
            createdAt: new Date(blobTags.tags['createdDate']),
            lastModifiedAt: new Date(blobProperties.lastModified!),
            transmissionStatus: blobTags.tags['transmissionStatus'],
            uploadedByType: blobTags.tags['uploadedByType'],
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
            uploadedByType: file.uploadedByType,
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

// upload file to blob storage
async function uploadBlobFile(file: Buffer, fileName: string, contentType: string, tags: Record<string, string>, metadata: Record<string, string>): Promise<boolean> {
    const blobStorageConnection = 'BLOB_CONNECTION_STRING';
    const containerName = process.env['BLOB_CONTAINER_NAME'] || '';
    const connectionString = process.env[blobStorageConnection];

    // check if connectionString is defined in environment variables else throw error
    if (!connectionString) {
        throw new Error(`Unknown storage account, ${blobStorageConnection} is not defined in environment variables`);
    }

    // upload file to blob storage
    // Location: container/caseId/aamc-transfer-packages/<application_id>_YYYY-MM-DDThhmmss.zip
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobLocation = `${tags.caseId}/aamc-transfer-packages/${fileName}`;
    const blobClient = containerClient.getBlockBlobClient(blobLocation);
    const uploadBlobResponse = await blobClient.upload(file, file.length, {
        blobHTTPHeaders: { blobContentType: contentType },
        tags: tags,
        metadata: metadata,
    });

    if (!uploadBlobResponse) {
        throw new Error(`Unable to upload file, ${fileName} to container, ${containerName}`);
    }

    return true;
}

export default { getBlobList, downloadBlobFiles, uploadBlobFile };
