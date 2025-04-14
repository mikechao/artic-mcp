import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const fullTextSearchSchema = z.object({
  query: z.string().describe('The term to search the metadata for.'),
  limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
  page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
});

export class FullTextSearchTool extends BaseTool<typeof fullTextSearchSchema, any> {
  public readonly name: string = 'full-text-search';
  public readonly description: string = 'Search for artworks in the Art Institute of Chicago collection'
    + ' whose metadata contains mention of the query term.'
    + 'Pagination is supported with the page parameter';

  public readonly inputSchema = fullTextSearchSchema;

  constructor() {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { query, limit, page } = input;

    const url = new URL(`${this.apiBaseUrl}/artworks/search`);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('limit', `${limit}`);
    url.searchParams.set('q', query);

    const parsedData = await this.safeApiRequest(
      url,
      { method: 'GET' },
      artworkSearchResponseSchema,
    );
    // Attach pagination info to each artwork for formatting
    parsedData.data.forEach((artwork) => {
      (artwork as any)._pagination = parsedData.pagination;
    });
    return this.formatArtworkList(parsedData.data, query);
  }
}
