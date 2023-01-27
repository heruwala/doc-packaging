interface Manifest {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
    Documents: {
        Document: IManifestDocumentMetadata[];
    }
}

interface IManifestDocumentMetadata {
    DocumentType: DocumentType;
    DocumentId: string;
    FileName: string | undefined;
    FileReceivedDateTime: string;
}