// given 2 pdf files buffer, merge them into a single pdf file using pdf-lib and return the merged pdf file buffer

import { PDFDocument } from 'pdf-lib';

async function annotatePdfDocuments(pdfFiles: Buffer[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    for (const pdfFile of pdfFiles) {
        const pdf = await PDFDocument.load(pdfFile);
        const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const mergedPdf = await pdfDoc.save();
    return mergedPdf;
}

export { annotatePdfDocuments };
