import { BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config';

// for given caseId get the list of files from blob storage
// TODO: replace with a call to an API
function getBlobList(caseId: string): BlobData[] {
    let blobList: BlobData[] = [
        {
            fileName: '123.pdf',
            docType: 'MSXSCRIPT',
            caseId: '123',
            documentId: 'D123',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'application/pdf'
        },
        {
            fileName: '456.pdf',
            docType: 'MSPE',
            caseId: '123',
            documentId: 'D456',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'application/pdf'
        },
        {
            fileName: '789.jpeg',
            docType: 'PHOTO',
            caseId: '123',
            documentId: 'D789',
            createDate: new Date('2023-01-24T18:29:12.621Z'),
            transmissionStatus: 'Pending',
            lastModified: new Date('2023-01-24T18:29:12.621Z'),
            contentType: 'image/jpeg'
        }
    ]
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
        let blobClient = containerClient.getBlobClient(file.fileName);

        const downloadBlockBlobResponse = await blobClient.download();

        if (!downloadBlockBlobResponse) {
            throw new Error(`Unable to download file, ${file.fileName} from container, ${containerName}`);
        }

        const downloadStream = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        streams.push({
            docType: file.docType,
            fileName: file.fileName,
            caseId: file.caseId,
            documentId: file.documentId,
            createDate: file.createDate,
            transmissionStatus: file.transmissionStatus,
            lastModified: file.lastModified,
            contentType: file.contentType,            
            fileContent: downloadStream,
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