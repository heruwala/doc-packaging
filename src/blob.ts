import { BlobServiceClient, BlobUploadCommonResponse } from '@azure/storage-blob';
import 'dotenv/config';
import internal from 'stream';
import { BlobActions, FileInfo } from './blob-actions';

export interface IBlobStorage {
    findBlobsByTags(tagQuery: string): Promise<BlobData[]>;
    writeStreamToBlob(blobName: string, containerName: string, stream: internal.Readable, contentType: string): Promise<BlobUploadCommonResponse>;
    readStreamFromBlob(blobName: string, containerName: string): Promise<NodeJS.ReadableStream>;
    updateBlob(blobName: string, containerName: string, currentRunTime: Date): Promise<boolean>;
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
    public async findBlobsByTags(tagQuery: string): Promise<BlobData[]> {
        const files: FileInfo[] = await new BlobActions(this.accountName, this.accountKey).findBlobsByTags(tagQuery);
        let blobData: BlobData[] = [];
        if (files.length > 0) {
            blobData = files.map((file) => {
                return {
                    caseId: file.tags!.caseId,
                    contentType: file.contentType,
                    createdAt: new Date(file.tags!.createdDate),
                    documentId: file.name,
                    documentName: file.metadata!.document_name,
                    documentType: <DocumentType>file.tags!.documentType,
                    lastModifiedAt: new Date(file.lastModified!),
                    transmissionStatus: file.tags!.transmissionStatus,
                    uploadedByType: file.tags!.uploadedByType,
                };
            });
        }
        return blobData;
    }

    public async writeStreamToBlob(
        blobName: string,
        containerName: string,
        stream: internal.Readable,
        contentType: string,
        tags?: Record<string, string>,
        metadata?: Record<string, string>
    ): Promise<BlobUploadCommonResponse> {
        return new BlobActions(this.accountName, this.accountKey).writeStreamToBlob(blobName, containerName, stream, contentType, tags, metadata);
    }

    public async readStreamFromBlob(blobName: string, containerName: string): Promise<NodeJS.ReadableStream> {
        const something = await new BlobActions(this.accountName, this.accountKey).readStreamFromBlob(blobName, containerName);
        return something.readableStreamBody!;
    }

    public async updateBlob(blobName: string, containerName: string, currentRunTime: Date): Promise<boolean> {
        // find blob by blobName and update blob tags and metadata
        const blobInfo = await new BlobActions(this.accountName, this.accountKey).getBlobInfo(blobName, containerName);

        if (!blobInfo) {
            throw new Error(`Unable to find blob, ${blobName} in container, ${containerName}`);
        }

        const updatedTags = updateRecord(blobInfo.tags!, "transmissionStatus", "transmitted");
        const updatedMetadata = updateRecord(blobInfo.metadata!, "transmission_date", currentRunTime.toISOString());

        const blobTagResult = await new BlobActions(this.accountName, this.accountKey).updateBlobTags(blobName, containerName, updatedTags);
        const blobMetadataResult = await new BlobActions(this.accountName, this.accountKey).updateBlobMetadata(blobName, containerName, updatedMetadata);
        
        return blobTagResult._response.status === 204 && blobMetadataResult._response.status === 200;
    }
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

const updateRecord = (record: Record<string, string>, key: string, value: string): Record<string, string> => {
    return {
      ...record,
      [key]: value
    };
  };

export default { downloadBlobFiles };
