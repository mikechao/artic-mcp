import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const titleSearchSchema = z.object({
  title: z.string().describe('The title of the artwork to search for.'),
  limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
  page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
});

export class SearchByTitleTool extends BaseTool<typeof titleSearchSchema, any> {
  public readonly name: string = 'search-by-title';
  public readonly description: string = 'Search for artworks by title in the Art Institute of Chicago. Pagination is supported with the page parameter';
  public readonly inputSchema = titleSearchSchema;

  constructor() {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { title, limit, page } = input;

    const query = {
      query: {
        bool: {
          should: [
            { match_phrase: { title: `${title}` } },
            { match_phrase: { alt_titles: `${title}` } },
          ],
          minimum_should_match: 1,
        },
      },
    };

    const url = new URL(`${this.apiBaseUrl}/artworks/search`);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('limit', `${limit}`);

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

    return this.formatArtworkList(parsedData.data, title);
  }
}
