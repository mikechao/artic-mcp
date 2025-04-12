import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';

export class SearchByTitleTool {
  public readonly name: string = 'search-by-title';
  public readonly description: string = 'Search for artworks by title in the Art Institute of Chicago. Pagination is supported with the page parameter';
  public readonly inputSchema = z.object({
    title: z.string().describe('The title of the artwork to search for.'),
    limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
    page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
  });

  private readonly apiBaseUrl: string = `https://api.artic.edu/api/v1/artworks/search`;

  public async execute(input: z.infer<typeof this.inputSchema>) {
    const { title, limit, page } = input;

    try {
      const query = {
        bool: {
          should: [
            {
              match_phrase: {
                title: `${title}`,
              },
            },
            {
              match_phrase: {
                alt_titles: `${title}`,
              },
            },
          ],
          minimum_should_match: 1,
        },
      };
      const jsonQuery = JSON.stringify(query);
      const encodedQuery = encodeURIComponent(jsonQuery);

      const url = new URL(this.apiBaseUrl);
      url.searchParams.set('page', `${page}`);
      url.searchParams.set('limit', `${limit}`);
      url.searchParams.set('params', encodedQuery);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      const parsedResponse = artworkSearchResponseSchema.safeParse(jsonResponse);
      if (!parsedResponse.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parsedResponse.error.issues, null, 2)}`);
      }
      const parsedData = parsedResponse.data;
      if (parsedData.data.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `No artworks found for title "${title}".` }],
          isError: false,
        };
      }
      const text = parsedData.data.map((artwork) => {
        return `Title: ${artwork.title}\n`
          + `ID: ${artwork.id}\n`
          + `Score: ${artwork._score}\n`;
      }).join('\n-----\n');

      return {
        content: [{ type: 'text' as const, text }],
      };
    }
    catch (error) {
      console.error('Error executing search:', error);
      return {
        content: [{ type: 'text' as const, text: `Error searching by title ${title}: ${error}` }],
        isError: true,
      };
    }
  }
}
