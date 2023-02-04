import * as xml2js from 'xml2js';

function createManifestFile(zipFileName: string, zipFileCreateDateTime: Date, aamcApplicationId: string, seasonId: string, blobDocuments: BlobData[]): Buffer {
    const manifestHeader = {
        ZipFileName: zipFileName,
        ZipFileCreateDateTime: zipFileCreateDateTime.toISOString(),
        SourceOrganization: 'EFDO',
        ApplicationId: aamcApplicationId,
        SeasonId: seasonId,
    };

    const documents = {
        Document: blobDocuments.map((blobDocument) => {
            return {
                DocumentType: blobDocument.documentType,
                DocumentId: blobDocument.documentId,
                FileName: blobDocument.documentName,
                FileReceivedDateTime: blobDocument.createdAt.toISOString(),
            };
        }),
    };

    const manifest = new ManifestClass(manifestHeader, documents);
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
    };

    constructor(manifestHeader: IManifestHeader, documents: { Document: IManifestDocumentMetadata[] }) {
        this.ZipFileName = manifestHeader.ZipFileName;
        this.ZipFileCreateDateTime = manifestHeader.ZipFileCreateDateTime;
        this.SourceOrganization = 'EFDO';
        this.ApplicationId = manifestHeader.ApplicationId;
        this.SeasonId = manifestHeader.SeasonId;
        this.Documents = documents;
    }

    addHeader(zipFileName: string, zipFileCreateDateTime: Date, aamcApplicationId: string, seasonId: string) {
        this.ZipFileName = zipFileName;
        this.ZipFileCreateDateTime = zipFileCreateDateTime.toISOString();
        this.SourceOrganization = 'EFDO';
        this.ApplicationId = aamcApplicationId;
        this.SeasonId = seasonId;
    }

    addHeaderFromObject(manifestHeader: IManifestHeader) {
        this.ZipFileName = manifestHeader.ZipFileName;
        this.ZipFileCreateDateTime = manifestHeader.ZipFileCreateDateTime;
        this.SourceOrganization = manifestHeader.SourceOrganization;
        this.ApplicationId = manifestHeader.ApplicationId;
        this.SeasonId = manifestHeader.SeasonId;
    }

    addDocument(document: IManifestDocumentMetadata) {
        this.Documents.Document.push(document);
    }

    generateManifestXml(): string {
        const builder = new xml2js.Builder({
            rootName: 'Manifest',
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
