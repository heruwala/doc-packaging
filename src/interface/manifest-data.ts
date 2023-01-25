interface Manifest {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
    Documents: {
        Document: Document[];
    }
}

interface Document {
    DocumentType: DocumentType;
    DocumentId: string;
    FileName: string;
    FileReceivedDateTime: string;
}