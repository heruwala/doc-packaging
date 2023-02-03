// given an array of files containing filename and fileData as buffer, return a zip file buffer
import JSZip from 'jszip';

export const zipFiles = async (files: { documentName: any; documentContent: any }[]): Promise<Buffer> => {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.documentName, file.documentContent));
    return await zip.generateAsync({ type: 'nodebuffer' });
};
