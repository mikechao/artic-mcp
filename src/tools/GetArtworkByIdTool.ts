import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import imageToBase64 from 'image-to-base64';
import z from 'zod';
import { artworkResponseSchema, artworkSchema } from '../schemas/schemas';

export class GetArtworkByIdTool {
  public readonly name: string = 'get-artwork-by-id';
  public readonly description: string = `Get a specific artwork by its ID from the Art Institute of Chicago. `
    + `Using the value of Artwork ID from the 'search-by-title' tool.`;

  public readonly inputSchema = z.object({
    id: z.number().describe('The ID of the artwork to retrieve.'),
  });

  public readonly imageByTitle = new Map<string, string>();

  private readonly fields: string[] = Object.keys(artworkSchema._def.shape());

  private readonly apiBaseUrl: string = `https://api.artic.edu/api/v1/artworks`;

  constructor(private server: McpServer) {}

  public async execute(input: z.infer<typeof this.inputSchema>) {
    const { id } = input;

    try {
      const url = new URL(`${this.apiBaseUrl}/${id}`);
      url.searchParams.set('fields', this.fields.join(','));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'AIC-User-Agent': 'artic-mcp (mike.chao.one@gmail.com)',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      const parsedResponse = artworkResponseSchema.safeParse(jsonResponse);
      if (!parsedResponse.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parsedResponse.error.issues, null, 2)}`);
      }
      const artwork = parsedResponse.data.data;
      const text = `Title: ${artwork.title}\n`
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

      const content = [];
      content.push({ type: 'text' as const, text });
      const image = await this.getArtworkImage(artwork, `${parsedResponse.data.config.iiif_url}`);
      if (image) {
        content.push(image);
      }
      return { content };
    }
    catch (error) {
      console.error(`Error fetching artwork by id ${id}:`, error);
      return {
        content: [{ type: 'text' as const, text: `Error searching by id ${id}: ${error}` }],
        isError: true,
      };
    }
  }

  private async getArtworkImage(artwork: z.infer<typeof artworkSchema>, iiif_url: string) {
    if (!artwork.image_id) {
      try {
        const imageURL = `${iiif_url}/${artwork.image_id}/full/843,/0/default.jpg`;
        const imageBase64 = await imageToBase64(imageURL);
        this.imageByTitle.set(artwork.title, imageBase64);
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
  }
}
