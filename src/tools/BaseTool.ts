import type { z } from 'zod';
import { articRateLimiter } from '../utils/RateLimiter';

export abstract class BaseTool<T extends z.ZodType, R> {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly inputSchema: T;
  protected readonly apiBaseUrl: string = 'https://api.artic.edu/api/v1';

  protected constructor() {}

  public abstract executeCore(input: z.infer<T>): Promise<R>;

  public async execute(input: z.infer<T>) {
    try {
      return await this.executeCore(input);
    }
    catch (error) {
      console.error(`Error executing ${this.name}:`, error);
      return {
        content: [{
          type: 'text' as const,
          text: `Error in ${this.name}: ${error}`,
        }],
        isError: true,
      };
    }
  }

  protected getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'AIC-User-Agent': 'artic-mcp (mike.chao.one@gmail.com)',
    };
  }

  protected async safeApiRequest<S extends z.ZodType>(
    url: URL | string,
    options: RequestInit,
    schema: S,
  ): Promise<z.infer<S>> {
    const response = await articRateLimiter.fetch(url.toString(), {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const parsedResponse = schema.safeParse(jsonResponse);

    if (!parsedResponse.success) {
      throw new Error(`Invalid response shape: ${JSON.stringify(parsedResponse.error.issues, null, 2)}`);
    }

    return parsedResponse.data;
  }

  protected formatArtworkList(artworks: any[], query: string) {
    if (artworks.length === 0) {
      return {
        content: [{ type: 'text' as const, text: `No artworks found for "${query}".` }],
        isError: false,
      };
    }

    const artText = artworks.map((artwork) => {
      return `Title: ${artwork.title}\n`
        + `Artwork ID: ${artwork.id}\n`
        + `Thumbnail alt text: ${artwork.thumbnail?.alt_text ?? 'No thumbnail available'}\n`
        + `Score: ${artwork._score}\n`;
    }).join('\n-----\n');

    const paginationText = artworks.length > 0
      ? `\nPagination Info\n`
      + `Total: ${artworks[0]._pagination?.total || 'Unknown'}\n`
      + `Total Pages: ${artworks[0]._pagination?.total_pages || 'Unknown'}\n`
      + `Current Page: ${artworks[0]._pagination?.current_page || 'Unknown'}`
      : '';

    return {
      content: [{ type: 'text' as const, text: artText + paginationText }],
    };
  }
}
