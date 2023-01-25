interface BlobData {
    fileName: string;
    lastModified: Date;
    createDate: Date;
    documentId: string;
    docType: DocumentType;
    contentType: string;
    transmissionStatus: string;
    caseId: string;
    fileContent?: any;
}

const MSPE = 'MSPE' as const;
const MSXSCRIPT = 'MSXSCRIPT' as const;
const ABSITE = 'ABSITE' as const;
const PHOTO = 'PHOTO' as const;

type DocumentType = typeof MSPE | typeof MSXSCRIPT | typeof ABSITE | typeof PHOTO;