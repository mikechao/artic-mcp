import z from 'zod';
import { artworkResponseSchema, artworkSchema } from '../schemas/schemas';

export class GetArtworkByIdTool {
  public readonly name: string = 'get-artwork-by-id';
  public readonly description: string = `Get a specific artwork by its ID from the Art Institute of Chicago. `
    + `Using the value of Artwork ID from the 'search-by-title' tool.`;

  public readonly inputSchema = z.object({
    id: z.number().describe('The ID of the artwork to retrieve.'),
  });

  private readonly fields: string[] = Object.keys(artworkSchema._def.shape());

  public async execute(input: z.infer<typeof this.inputSchema>) {
    const { id } = input;

    try {
      const url = new URL(`https://api.artic.edu/api/v1/artworks/${id}`);
      url.searchParams.set('fields', this.fields.join(','));
      console.error(`Fetching artwork by id ${id} from\n ${url.toString()}`);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
        + `Description: ${artwork.description}\n`
        + `Image ID: ${artwork.image_id}\n`
        + `Place of Origin: ${artwork.place_of_origin}\n`
        + `Dimensions: ${artwork.dimensions}\n`
        + `Medium: ${artwork.medium_display}\n`
        + `Credit Line: ${artwork.credit_line}\n`
        + `Department: ${artwork.department_title}\n`
        + `Is On View: ${artwork.is_on_view ? 'Yes' : 'No'}`;

      const content = [];
      content.push({ type: 'text' as const, text });
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
}
