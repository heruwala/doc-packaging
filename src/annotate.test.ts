// given 2 pdf files buffer, merge them into a single pdf file and return the merged pdf file buffer

import { annotatePdfDocuments, annotatePdfDocuments1 } from './annotate';
//import { promises as fs } from 'fs';
import * as fs from 'fs';
//import { Readable } from 'stream';
import path from 'path';
import internal from 'stream';

describe('mergePdfFiles', () => {
    // it('should merge 2 pdf files', async () => {
    //     const pdf1 = await fs.readFile('./annotations/Cover.pdf');
    //     const pdf2 = await fs.readFile('./test/fixtures/file-sample.pdf');
    //     const mergedPdf = await annotatePdfDocuments([pdf1, pdf2]);
    //     expect(mergedPdf).toBeDefined();
    // });

    it('Should merge 2 pdf file streams into a readable', async () => {
        let pdf1: internal.Readable = fs.createReadStream(path.resolve(__dirname, './annotate/cover.pdf'));
        let pdf2: internal.Readable = fs.createReadStream('./test/fixtures/file-sample.pdf');
        const mergedPdfReadableStream = await annotatePdfDocuments1(pdf1, pdf2);
        // write stream to local file
        const writeStream = fs.createWriteStream('./test/fixtures/merged.pdf');
        mergedPdfReadableStream.pipe(writeStream);

        expect(mergedPdfReadableStream).toBeDefined();          
    });
});
