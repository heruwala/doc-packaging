import { BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config';

// for given caseId get the list of files from blob storage
// TODO: replace with a call to an API
function getBlobList(caseId: string) {
    let blobList: BlobList[] = [
        {
            fileName: '123.pdf',
            docType: 'transcript',
            caseId: '123',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'application/pdf'
        },
        {
            fileName: '456.pdf',
            docType: 'transcript',
            caseId: '123',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'application/pdf'
        },
        {
            fileName: '789.pdf',
            docType: 'photo',
            caseId: '123',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'application/pdf'
        }
    ]
    return blobList;
}

// download blob files from azure blob storage based on input fileNames parameter and return a list of streams
async function downloadBlobFiles(fileNames: string[]) {
    //const streams: { fileName: string; stream: NodeJS.ReadableStream | undefined; }[] = [];
    //let streams: { fileName: string; stream: any; }[] = [];
    let streams: any[] = [];
    for (let file of fileNames) {
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
        let blobClient = containerClient.getBlobClient(file);

        const downloadBlockBlobResponse = await blobClient.download();

        if (!downloadBlockBlobResponse) {
            throw new Error(`Unable to download file, ${file} from container, ${containerName}`);
        }

        const downloadStream = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        streams.push({
            fileName: file,
            stream: downloadStream,
        });
    };
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