// given 2 pdf files buffer, merge them into a single pdf file using pdf-lib and return the merged pdf file buffer

import { PDFDocument } from 'pdf-lib';
import internal from 'stream';

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

// given 2 pdf file streams, convert them into array buffers and merge them into a single pdf file using pdf-lib and return the merged pdf file as a readable stream
async function annotatePdfDocuments1(pdfFile1: internal.Readable, pdfFile2: internal.Readable): Promise<internal.Readable> {
    const pdf1 = await readableToBuffer(pdfFile1);
    const pdf2 = await readableToBuffer(pdfFile2);
    const mergedPdf = await annotatePdfDocuments([pdf1, pdf2]);
    const mergedPdfReadableStream = bufferToReadable(mergedPdf);
    return mergedPdfReadableStream;
}

async function readableToBuffer(readable: internal.Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      readable.on('data', (chunk) => {
        chunks.push(chunk);
      });
      readable.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readable.on('error', (error) => {
        reject(error);
      });
    });
  }

  // given a Uint8Array, convert it into a readable stream
 async function bufferToReadable(buffer: Uint8Array): Promise<internal.Readable> {
    const readable = new internal.Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }
  
export { annotatePdfDocuments, annotatePdfDocuments1 };
