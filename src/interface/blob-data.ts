interface BlobData {
    documentName: string | undefined;
    lastModifiedAt: Date;
    createdAt: Date;
    documentId: string;
    documentType: DocumentType;
    contentType: string | undefined;
    transmissionStatus: string;
    caseId: string;
    documentContent?: any;
}

const MSPE = 'MSPE' as const;
const MSXSCRIPT = 'MSXSCRIPT' as const;
const ABSITE = 'ABSITE' as const;
const PTAL = 'PTAL' as const;
const PHOTO = 'PHOTO' as const;

type DocumentType = typeof MSPE | typeof MSXSCRIPT | typeof ABSITE | typeof PTAL | typeof PHOTO;