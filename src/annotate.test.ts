// given 2 pdf files buffer, merge them into a single pdf file and return the merged pdf file buffer

import { annotatePdfDocuments } from './annotate';
import { promises as fs } from 'fs';

describe('mergePdfFiles', () => {
    it('should merge 2 pdf files', async () => {
        const pdf1 = await fs.readFile('./annotations/MIDUS Cover.pdf');
        const pdf2 = await fs.readFile('./test/fixtures/file-sample.pdf');
        const mergedPdf = await annotatePdfDocuments([pdf1, pdf2]);
        expect(mergedPdf).toBeDefined();
    });
});
