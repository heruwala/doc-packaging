import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerListBlobsOptions, StorageSharedKeyCredential } from '@azure/storage-blob';
import internal from 'stream';

export interface FileInfo {
    name: string;
    url: string;
    size?: number;
    contentType?: string;
    lastModified?: Date;
    tags?: Record<string, string>;
    metadata?: Record<string, string>;
}

export class BlobActions {
    private readonly sharedKeyCredential: StorageSharedKeyCredential;

    public constructor(private accountName: string, private accountKey: string) {
        this.sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    }

    /**
   * @param tagQuery
   * example: "@container='mycontainer' AND createDate >  '2021-01-01T00:00:00Z' AND createDate < '2021-01-02T00:00:00Z'"
   
   */
    public findBlobsByTags = async (tagQuery: string): Promise<FileInfo[]> => {
        const blobServiceClient = new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net/`, this.sharedKeyCredential);

        let blobList: FileInfo[] = [];
        for await (const blob of blobServiceClient.findBlobsByTags(tagQuery)) {
            const blobProperties = await blobServiceClient.getContainerClient(blob.containerName).getBlobClient(blob.name).getProperties();
            const blobTags = await blobServiceClient.getContainerClient(blob.containerName).getBlobClient(blob.name).getTags();
            blobList.push({
                //contentLength and contentType are not available in the findBlobsByTagsResponse https://learn.microsoft.com/en-us/rest/api/storageservices/find-blobs-by-tags
                name: blob.name,
                url: `https://${this.accountName}.blob.core.windows.net/${blob.containerName}/${blob.name}`,
                tags: blobTags.tags,
                metadata: blobProperties.metadata,
                contentType: blobProperties.contentType,
                lastModified: blobProperties.lastModified,
            });
        }
        return blobList;
    };

    public getBlobInfo = async (blobName: string, container: string): Promise<FileInfo> => {
        const blobServiceClient = new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net/`, this.sharedKeyCredential);

        const blobProperties = await blobServiceClient.getContainerClient(container).getBlobClient(blobName).getProperties();
        const blobTags = await blobServiceClient.getContainerClient(container).getBlobClient(blobName).getTags();
        return {
            name: blobName,
            url: `https://${this.accountName}.blob.core.windows.net/${container}/${blobName}`,
            tags: blobTags.tags,
            metadata: blobProperties.metadata,
            contentType: blobProperties.contentType,
            lastModified: blobProperties.lastModified,
        };
    };

    public listBlobs = async (containerName: string, prefix?: string): Promise<FileInfo[]> => {
        const blobServiceClient = new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net/`, this.sharedKeyCredential);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const options: ContainerListBlobsOptions = {
            includeMetadata: true,
            includeTags: true,
        };
        if (prefix) options.prefix = prefix;

        let blobList: FileInfo[] = [];
        for await (const blob of containerClient.listBlobsFlat(options)) {
            console.log(blob);
            blobList.push({
                name: blob.name,
                url: `https://${this.accountName}.blob.core.windows.net/${containerName}/${blob.name}`,
                size: blob.properties.contentLength,
                contentType: blob.properties.contentType,
                tags: blob.tags,
            });
        }
        return blobList;
    };

    public writeStreamToBlob = async (blobName: string, container: string, stream: internal.Readable, contentType: string = 'application/octet-stream', tags?: Record<string, string>, metadata?: Record<string, string>) => {
        const blobUrl = 'https://' + this.accountName + '.blob.core.windows.net/' + container + '/' + blobName;
        const blobClient = new BlockBlobClient(blobUrl, this.sharedKeyCredential);
        return blobClient.uploadStream(stream, undefined, undefined, { blobHTTPHeaders: { blobContentType: contentType }, tags: tags, metadata: metadata });
    };

    public readStreamFromBlob = async (blobName: string, container: string, offset?: number, count?: number): Promise<BlobDownloadResponseParsed> => {
        const blobUrl = 'https://' + this.accountName + '.blob.core.windows.net/' + container + '/' + blobName;
        const blobClient = new BlockBlobClient(blobUrl, this.sharedKeyCredential);
        return blobClient.download(0);
    };

    public updateBlobTags = async (blobName: string, container: string, tags: Record<string, string>) => {
        const blobUrl = 'https://' + this.accountName + '.blob.core.windows.net/' + container + '/' + blobName;
        const blobClient = new BlockBlobClient(blobUrl, this.sharedKeyCredential);
        return blobClient.setTags(tags);
    };

    public updateBlobMetadata = async (blobName: string, container: string, metadata: Record<string, string>) => {
        const blobUrl = 'https://' + this.accountName + '.blob.core.windows.net/' + container + '/' + blobName;
        const blobClient = new BlockBlobClient(blobUrl, this.sharedKeyCredential);
        return blobClient.setMetadata(metadata);
    };
}
