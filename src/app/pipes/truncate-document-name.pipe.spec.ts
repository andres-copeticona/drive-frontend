import { TruncateDocumentNamePipe } from './truncate-document-name.pipe';

describe('TruncateDocumentNamePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateDocumentNamePipe();
    expect(pipe).toBeTruthy();
  });
});
