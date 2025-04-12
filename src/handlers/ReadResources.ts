import type { ReadResourceRequest } from '@modelcontextprotocol/sdk/types.js';
import type { GetArtworkByIdTool } from '../tools/GetArtworkByIdTool';

export class ReadResources {
  constructor(private getArtworkByIdTool: GetArtworkByIdTool) {}

  public async handle(request: ReadResourceRequest) {
    const uri = request.params.uri;
    if (uri.startsWith('artic-image://')) {
      const title = uri.split('://')[1];
      const image = this.getArtworkByIdTool.imageByTitle.get(title);
      if (image) {
        return {
          contents: [{
            uri,
            mimeType: 'image/jpeg',
            blob: image,
          }],
        };
      }
    }
    return {
      content: [{ type: 'text', text: `Resource not found: ${uri}` }],
      isError: true,
    };
  }
}
