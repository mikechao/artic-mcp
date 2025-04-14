import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import imageToBase64 from 'image-to-base64';
import z from 'zod';
import { artworkResponseSchema, artworkSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const artworkByIdSchema = z.object({
  id: z.number().describe('The ID of the artwork to retrieve.'),
});

export class GetArtworkByIdTool extends BaseTool<typeof artworkByIdSchema, any> {
  public readonly name: string = 'get-artwork-by-id';
  public readonly description: string = `Get additional information, including an image if available, about a specific artwork by its ID`
    + ` from the Art Institute of Chicago. `
    + `Using the value of Artwork ID from the 'search-by-title' tool.`;

  public readonly inputSchema = artworkByIdSchema;
  public readonly imageByTitle = new Map<string, string>();
  private readonly fields: string[] = Object.keys(artworkSchema._def.shape());

  constructor(private server: McpServer) {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { id } = input;

    const url = new URL(`${this.apiBaseUrl}/artworks/${id}`);
    url.searchParams.set('fields', this.fields.join(','));

    const parsedResponse = await this.safeApiRequest(
      url,
      { method: 'GET' },
      artworkResponseSchema,
    );
    const artwork = parsedResponse.data;
    const text = this.formatArtworkDetails(artwork);

    const content = [];
    content.push({ type: 'text' as const, text });
    const image = await this.getArtworkImage(artwork, `${parsedResponse.config.iiif_url}`);
    if (image) {
      content.push(image);
    }
    return { content };
  }

  private formatArtworkDetails(artwork: z.infer<typeof artworkSchema>) {
    return `Title: ${artwork.title}\n`
      + `${artwork.alt_titles ? `Alt Titles: ${artwork.alt_titles.join(', ')}\n` : ''}`
      + `Artist: ${artwork.artist_display}\n`
      + `Artist ID: ${artwork.artist_id}\n`
      + `Description: ${artwork.description ?? 'No description available'}\n`
      + `Image ID: ${artwork.image_id}\n`
      + `Place of Origin: ${artwork.place_of_origin}\n`
      + `Dimensions: ${artwork.dimensions}\n`
      + `Medium: ${artwork.medium_display}\n`
      + `Credit Line: ${artwork.credit_line}\n`
      + `Department: ${artwork.department_title}\n`
      + `Is On View: ${artwork.is_on_view ? 'Yes' : 'No'}`;
  }

  private async getArtworkImage(artwork: z.infer<typeof artworkSchema>, iiif_url: string) {
    if (artwork.image_id) {
      try {
        const imageURL = `${iiif_url}/${artwork.image_id}/full/843,/0/default.jpg`;
        const imageBase64 = await imageToBase64(imageURL);
        const title = `${artwork.title} (${artwork.artist_display})`;
        this.imageByTitle.set(title, imageBase64);
        this.server.server.notification({
          method: 'notifications/resources/list_changed',
        });
        return {
          type: 'image' as const,
          data: imageBase64,
          mimeType: 'image/jpeg',
        };
      }
      catch (error) {
        console.error(`Error fetching image for artwork ${artwork.id}:`, error);
        return {
          type: 'text' as const,
          text: `Error fetching image for artwork ${artwork.id}: ${error}`,
        };
      }
    }
    return null;
  }
}
