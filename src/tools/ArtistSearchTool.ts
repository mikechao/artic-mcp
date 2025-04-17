import { z } from 'zod';
import { artistSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const artistSearchSchema = z.object({
  name: z.string().describe('The name of the artist to search for.'),
  limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
  page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
});

export class ArtistSearchTool extends BaseTool<typeof artistSearchSchema, any> {
  public readonly name: string = 'search-for-artist';
  public readonly description: string = `Search for artists in the Art Institute of Chicago collection.`
    + `This tool will only check if the artist exists in the collection. No information about artworks will be provided.`
    + `It will return Title, Artist ID, and Score.`;

  public readonly inputSchema = artistSearchSchema;

  constructor() {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { name, limit, page } = input;

    const query = {
      query: {
        bool: {
          should: [
            { match_phrase: { title: `"${name}"` } },
          ],
          minimum_should_match: 1,
        },
      },
    };

    const url = new URL(`${this.apiBaseUrl}/agents/search`);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('limit', `${limit}`);

    const parsedData = await this.safeApiRequest(
      url,
      {
        method: 'POST',
        body: JSON.stringify(query),
      },
      artistSearchResponseSchema,
    );
    if (parsedData.data.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: `No results found for "${name}".`,
        }],
      };
    }
    const text = parsedData.data.map((artist) => {
      return `Title: ${artist.title}\n`
        + `Artist ID: ${artist.id}\n`
        + `Score: ${artist._score}\n`;
    }).join('\n-----\n');
    const paginationText = `\nPagination Info\n`
      + `Total: ${parsedData.pagination.total}\n`
      + `Total Pages: ${parsedData.pagination.total_pages}\n`
      + `Current Page: ${parsedData.pagination.current_page}\n`;

    return {
      content: [{ type: 'text' as const, text: text + paginationText }],
    };
  }
}
