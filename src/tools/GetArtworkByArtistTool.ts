import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const artworkByArtistSchema = z.object({
  id: z.number().describe('The id of the artist to search for artworks. Should be the Artist ID of the `search-for-artist` tool.'),
  limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
  page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
});

export class GetArtworkByArtistTool extends BaseTool<typeof artworkByArtistSchema, any> {
  public readonly name: string = 'get-artwork-by-artist';
  public readonly description: string = 'Get artworks by artist id in the Art Institute of Chicago collection. Pagination is supported with the page parameter.';
  public readonly inputSchema = artworkByArtistSchema;

  constructor() {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { id, limit, page } = input;

    const query = {
      query: {
        term: {
          artist_id: id,
        },
      },
    };

    const url = new URL(`${this.apiBaseUrl}/artworks/search`);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('limit', `${limit}`);
    url.searchParams.set('query', `artist_id:${id}`);

    const parsedData = await this.safeApiRequest(
      url,
      {
        method: 'POST',
        body: JSON.stringify(query),
      },
      artworkSearchResponseSchema,
    );
    // Attach pagination info to each artwork for formatting
    parsedData.data.forEach((artwork) => {
      (artwork as any)._pagination = parsedData.pagination;
    });
    return this.formatArtworkList(parsedData.data, `Artworks by artist ID ${id}`);
  }
}
