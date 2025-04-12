import type { GetArtworkByIdTool } from '../tools/GetArtworkByIdTool';

export class ListResources {
  constructor(private getArtworkByIdTool: GetArtworkByIdTool) {}

  public async handle() {
    return {
      resources: [
        ...Array.from(this.getArtworkByIdTool.imageByTitle.keys()).map(title => ({
          uri: `artic-image://${title}`,
          mimeType: 'image/jpeg',
          name: `${title}`,
        })),
      ],
    };
  }
}
