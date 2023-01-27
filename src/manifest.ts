import * as xml2js from "xml2js";

function createManifestFile(zipFileName: string, zipFileCreateDateTime: Date, applicationId: string, seasonId: string, blobDocuments: BlobData[]): Buffer {
    const documents = {
        Document: blobDocuments.map((blobDocument) => {
            return {
                DocumentType: blobDocument.documentType,
                DocumentId: blobDocument.documentId,
                FileName: blobDocument.documentName,
                FileReceivedDateTime: blobDocument.createdAt.toISOString()
            }
        })
    };
    
    const manifest = new ManifestClass(zipFileName, zipFileCreateDateTime.toISOString(), applicationId, seasonId, documents);
    const manifestFile = manifest.generateManifestDocument();
    return manifestFile;
}

class ManifestClass implements Manifest {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
    Documents: {
        Document: IManifestDocumentMetadata[];
    }

    constructor(zipFileName: string, zipFileCreateDateTime: string, applicationId: string, seasonId: string, documents: { Document: IManifestDocumentMetadata[] }) {
        this.ZipFileName = zipFileName;
        this.ZipFileCreateDateTime = zipFileCreateDateTime;
        this.SourceOrganization = "EFDO";
        this.ApplicationId = applicationId;
        this.SeasonId = seasonId;
        this.Documents = documents;
    }

    addHeader(zipFileName: string, zipFileCreateDateTime: Date, applicationId: string, seasonId: string) {
        this.ZipFileName = zipFileName;
        this.ZipFileCreateDateTime = zipFileCreateDateTime.toISOString();
        this.SourceOrganization = 'EFDO';
        this.ApplicationId = applicationId;
        this.SeasonId = seasonId;
    }
    
    addDocument(document: IManifestDocumentMetadata) {
        this.Documents.Document.push(document);
    }

    generateManifestXml(): string {
        const builder = new xml2js.Builder({
            rootName: 'Manifest'
        });
        const xml = builder.buildObject(this);
        return xml;
    }

    generateManifestDocument(): Buffer {
        const xml = this.generateManifestXml();
        const file = Buffer.from(xml, 'utf-8');
        return file;
    }
}

export default { createManifestFile };