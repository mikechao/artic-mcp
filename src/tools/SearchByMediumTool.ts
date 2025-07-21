import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const mediumSearchSchema = z.object({
  medium: z
    .string()
    .describe(
      'The medium to search for (e.g., "oil on canvas", "acrylic on panel", "watercolor on paper").',
    ),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe('The number of resources to return per page.'),
  page: z
    .number()
    .optional()
    .default(1)
    .describe('The page of results to return. Used for pagination.'),
});

export class SearchByMediumTool extends BaseTool<
  typeof mediumSearchSchema,
  any
> {
  public readonly name: string = 'search-by-medium';
  public readonly description: string =
    'Search for artworks by medium in the Art Institute of Chicago. Pagination is supported with the page parameter';
  public readonly inputSchema = mediumSearchSchema;

  constructor() {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { medium, limit, page } = input;

    const query = {
      query: {
        bool: {
          should: [
            { match_phrase: { medium_display: `${medium}` } },
            { match: { medium_display: medium } },
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
    parsedData.data.forEach((artwork: any) => {
      artwork._pagination = parsedData.pagination;
    });

    return this.formatArtworkList(parsedData.data, medium);
  }
}
