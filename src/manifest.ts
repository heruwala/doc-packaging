import * as xml2js from "xml2js";

function generateManifest(zipFileName: string, zipFileCreateDateTime: string, applicationId: string, seasonId: string): string {

    const documents = {
        Document: [
            {
                DocumentType: 'MSPE',
                DocumentId: "6968504",
                FileName: "21147862_EFDO_MSPE.pdf",
                FileReceivedDateTime: "2022-05-19T14:02:48"
            },
            {
                DocumentType: 'MSXSCRIPT',
                DocumentId: "6968506",
                FileName: "21147862_EFDO_TRANSCRIPT.pdf",
                FileReceivedDateTime: "2022-05-19T14:04:57"
            },
            {
                DocumentType: 'ABSITE',
                DocumentId: "6968508",
                FileName: "21147862_EFDO_ABSITE.pdf",
                FileReceivedDateTime: "2022-05-19T14:13:45"
            }
        ] as Document[]
    };

    const manifest = new ManifestClass(zipFileName, zipFileCreateDateTime, applicationId, seasonId, documents);

    // initialize builder with root node name Manifest and namespace = "http://www.aamc.org/schemas/eras/file-exchange"
    const builder = new xml2js.Builder({
        rootName: 'Manifest'
    });
    const xml = builder.buildObject(manifest);
    return xml;
}

function createManifestFile(zipFileName: string, zipFileCreateDateTime: Date, applicationId: string, seasonId: string): Buffer {
    const manifest = generateManifest(zipFileName, zipFileCreateDateTime.toISOString(), applicationId, seasonId);
    const file = Buffer.from(manifest, 'utf-8');
    return file;
}

class ManifestClass implements Manifest {
    ZipFileName: string;
    ZipFileCreateDateTime: string;
    SourceOrganization: string;
    ApplicationId: string;
    SeasonId: string;
    Documents: {
        Document: Document[];
    }
    constructor(zipFileName: string, zipFileCreateDateTime: string, applicationId: string, seasonId: string, documents: { Document: Document[] }) {
        this.ZipFileName = zipFileName;
        this.ZipFileCreateDateTime = zipFileCreateDateTime;
        this.SourceOrganization = "EFDO";
        this.ApplicationId = applicationId;
        this.SeasonId = seasonId;
        this.Documents = documents;
    }
}

export default { generateManifest, createManifestFile };