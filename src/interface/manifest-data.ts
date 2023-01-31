interface Manifest {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
    Documents: {
        Document: IManifestDocumentMetadata[];
    };
}

interface IManifestHeader {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
}

interface IManifestDocumentMetadata {
    DocumentType: DocumentType;
    DocumentId: string;
    FileName: string | undefined;
    FileReceivedDateTime: string;
}
