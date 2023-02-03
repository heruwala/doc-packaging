import { zipFiles } from './zip';
// given an array of files containing filename and fileData as buffer, return a zip file buffer
describe('zipFiles', () => {
    it('should zip files', async () => {
        const files = [
            {
                documentName: 'file1.txt',
                documentContent: Buffer.from('file1'),
            },
            {
                documentName: 'file2.txt',
                documentContent: Buffer.from('file2'),
            },
        ];
        const zipFile = await zipFiles(files);
        expect(zipFile).toBeDefined();
    });
});