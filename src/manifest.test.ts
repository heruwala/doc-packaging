import manifest from './manifest';

describe('manifest', () => {
    it('should create a manifest file', () => {
        const zipFileName = '21147862_EFDO_2022-05-19T14_02_48.zip';
        const zipFileCreateDateTime = new Date();
        const applicationId = 'EFDO';
        const seasonId = '2023';
        const manifestFile = manifest.createManifestFile(zipFileName, zipFileCreateDateTime, applicationId, seasonId);
        expect(manifestFile).toBeDefined();
    });
});
