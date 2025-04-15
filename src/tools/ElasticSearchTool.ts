import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import process from 'node:process';
import OpenAI from 'openai';
import { z } from 'zod';
import { artworkSearchResponseSchema } from '../schemas/schemas';
import { BaseTool } from './BaseTool';

const elasticSearchSchema = z.object({
  query: z.string().describe(`The user's query about the artworks in the Art Institute of Chicago collection.`),
  limit: z.number().optional().default(10).describe('The number of resources to return per page.'),
  page: z.number().optional().default(1).describe('The page of results to return. Used for pagination.'),
});

export class ElasticSearchTool extends BaseTool<typeof elasticSearchSchema, any> {
  public readonly name: string = 'search-for-artwork';
  public readonly description: string = `Search for artworks in the Art Institute of Chicago collection by generate a Elastic Search query
   using OpenAI's model. The query is then used to search the collection for relevant artworks.
   Pagination is supported with the page parameter`;

  public readonly inputSchema = elasticSearchSchema;

  constructor(private server: McpServer) {
    super();
  }

  public async executeCore(input: z.infer<typeof this.inputSchema>) {
    const { query, limit, page } = input;
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in the environment variables.');
    }
    const elasticQuery = await this.generateElasticSearchQuery(query);
    const elasticQueryParsed = JSON.parse(elasticQuery);
    this.server.server.sendLoggingMessage({
      message: `Generated ElasticSearch query:\n ${JSON.stringify(elasticQueryParsed, null, 2)}`,
      level: 'info',
    });
    const url = new URL(`${this.apiBaseUrl}/artworks/search`);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('limit', `${limit}`);

    const parsedData = await this.safeApiRequest(
      url,
      {
        method: 'POST',
        body: JSON.stringify(elasticQueryParsed),
      },
      artworkSearchResponseSchema,
    );
    // Attach pagination info to each artwork for formatting
    parsedData.data.forEach((artwork) => {
      (artwork as any)._pagination = parsedData.pagination;
    });
    return this.formatArtworkList(parsedData.data, query);
  }

  private async generateElasticSearchQuery(query: string) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const text = `You are an AI assistant specialized in converting natural language queries into Elasticsearch queries. Your task is to interpret user questions about the Art Institute of Chicago art collection and generate the appropriate Elasticsearch query in JSON format.
    The document schema for the profiles is as follows:
    id integer - Unique identifier of this resource. Taken from the source system.
    title string - The name of this resource
    alt_titles array - Alternate names for this work
    main_reference_number string - Unique identifier assigned to the artwork upon acquisition
    has_not_been_viewed_much boolean - Whether the artwork hasn't been visited on our website very much
    date_start number - The year of the period of time associated with the creation of this work
    date_end number - The year of the period of time associated with the creation of this work
    date_display string - Readable, free-text description of the period of time associated with the creation of this work. This might include date terms like Dynasty, Era etc. Written by curators and editors in house style, and is the preferred field for display on websites and apps.
    artist_display string - Readable description of the creator of this work. Includes artist names, nationality and lifespan dates
    place_of_origin string - The location where the creation, design, or production of the work took place, or the original location of the work
    description string - Longer explanation describing the work
    medium_display string - The substances or materials used in the creation of a work
    credit_line string - Brief statement indicating how the work came into the collection
    fiscal_year number - The fiscal year in which the work was acquired.
    is_public_domain boolean - Whether the work is in the public domain, meaning it was created before copyrights existed or has left the copyright term
    is_on_view boolean - Whether the work is on display
    gallery_title string - The location of this work in our museum
    artwork_type_title string - The kind of object or work (e.g. Painting, Sculpture, Book)
    department_title string - Name of the curatorial department that this work belongs to
    artist_title string - Name of the preferred artist/culture associated with this work
    artist_titles array - Names of all artist/cultures associated with this work
    style_title string - The name of the preferred style term for this work
    image_id uuid - Unique identifier of the preferred image to use to represent this work
    
    Generate a JSON query for Elasticsearch. Provide only the raw JSON without any surrounding tags or markdown formatting, because we need to convert your response to an object. 
    Use a lenient approach with 'should' clauses instead of strict 'must' clauses. Include a 'minimum_should_match' parameter to ensure some relevance while allowing flexibility. Avoid using 'must' clauses entirely.
    All queries must be lowercase.
    
    Use 'match' queries instead of 'term' queries to allow for partial matches and spelling variations. Where appropriate, include fuzziness parameters to further increase tolerance for spelling differences. 
    For name fields or other phrases where word order matters, consider using 'match_phrase' with a slop parameter. Use 'multi_match' for fields that might contain the value in different subfields.`;

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      instructions: text,
      input: query,
    });

    return response.output_text;
  }
}
