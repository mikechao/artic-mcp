import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';

export class FullTextSearchTool {
  public readonly name: string = 'full-text-search';
  public readonly description: string = 'Search for artworks in the Art Institute of Chicago collection'
    + ' whose metadata contains mention of the query term.'
    + 'Pagination is supported with the page parameter';

  public readonly inputSchema = z.object({
    query: z.string().describe('The term to search the metadata for.'),
    limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
    page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
  });

  private readonly apiBaseUrl: string = `https://api.artic.edu/api/v1/artworks/search`;

  public async execute(input: z.infer<typeof this.inputSchema>) {
    const { query, limit, page } = input;

    try {
      const url = new URL(this.apiBaseUrl);
      url.searchParams.set('page', `${page}`);
      url.searchParams.set('limit', `${limit}`);
      url.searchParams.set('q', query);

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
      const parsedResponse = artworkSearchResponseSchema.safeParse(jsonResponse);
      if (!parsedResponse.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parsedResponse.error.issues, null, 2)}`);
      }
      const parsedData = parsedResponse.data;
      if (parsedData.data.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `No artworks found for query "${query}".` }],
          isError: false,
        };
      }
      const artText = parsedData.data.map((artwork) => {
        return `Title: ${artwork.title}\n`
          + `Artwork ID: ${artwork.id}\n`
          + `Thumbnail alt text: ${artwork.thumbnail?.alt_text ?? 'No thumbnail available'}\n`
          + `Score: ${artwork._score}\n`;
      }).join('\n-----\n');
      const paginationText = `\nPagination Info\n`
        + `Total: ${parsedData.pagination.total}\n`
        + `Total Pages: ${parsedData.pagination.total_pages}\n`
        + `Current Page: ${parsedData.pagination.current_page}`;

      const text = artText + paginationText;
      return {
        content: [{ type: 'text' as const, text }],
      };
    }
    catch (error) {
      console.error(`Error in full-text search using query ${query}: ${error}`);
      return {
        content: [{ type: 'text' as const, text: `Error in full-text search using query ${query}: ${error}` }],
        isError: true,
      };
    }
  }
}
