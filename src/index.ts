import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { McpAgent } from 'agents/mcp';
import z from 'zod';
import { ListResources } from './handlers/ListResources';
import { ReadResources } from './handlers/ReadResources';
import { getGalleryPrompt } from './prompts/GalleryPrompt';
import { ArtistSearchTool } from './tools/ArtistSearchTool';
import { FullTextSearchTool } from './tools/FullTextSearchTool';
import { GetArtworkByArtistTool } from './tools/GetArtworkByArtistTool';
import { GetArtworkByIdTool } from './tools/GetArtworkByIdTool';
import { SearchByTitleTool } from './tools/SearchByTitleTool';

export class ArticServer extends McpAgent {
  private searchByTitleTool!: SearchByTitleTool;
  private getArtworkByIdTool!: GetArtworkByIdTool;
  private fullTextSearchTool!: FullTextSearchTool;
  private artistSearchTool!: ArtistSearchTool;
  private getArtworkByArtistTool!: GetArtworkByArtistTool;
  private listResources!: ListResources;
  private readResources!: ReadResources;

  server = new McpServer(
    {
      name: 'artic-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        prompts: {},
        tools: {},
        resources: {},
      },
    },
  );

  async init() {
    this.searchByTitleTool = new SearchByTitleTool();
    this.getArtworkByIdTool = new GetArtworkByIdTool(this.server);
    this.fullTextSearchTool = new FullTextSearchTool();
    this.artistSearchTool = new ArtistSearchTool();
    this.getArtworkByArtistTool = new GetArtworkByArtistTool();
    this.listResources = new ListResources(this.getArtworkByIdTool);
    this.readResources = new ReadResources(this.getArtworkByIdTool);
    this.setupTools();
    this.setupRequestHandlers();
    this.setupPrompts();
  }

  private setupTools(): void {
    this.server.tool(
      this.searchByTitleTool.name,
      this.searchByTitleTool.description,
      this.searchByTitleTool.inputSchema.shape,
      this.searchByTitleTool.execute.bind(this.searchByTitleTool),
    );
    this.server.tool(
      this.getArtworkByIdTool.name,
      this.getArtworkByIdTool.description,
      this.getArtworkByIdTool.inputSchema.shape,
      this.getArtworkByIdTool.execute.bind(this.getArtworkByIdTool),
    );
    this.server.tool(
      this.fullTextSearchTool.name,
      this.fullTextSearchTool.description,
      this.fullTextSearchTool.inputSchema.shape,
      this.fullTextSearchTool.execute.bind(this.fullTextSearchTool),
    );
    this.server.tool(
      this.artistSearchTool.name,
      this.artistSearchTool.description,
      this.artistSearchTool.inputSchema.shape,
      this.artistSearchTool.execute.bind(this.artistSearchTool),
    );
    this.server.tool(
      this.getArtworkByArtistTool.name,
      this.getArtworkByArtistTool.description,
      this.getArtworkByArtistTool.inputSchema.shape,
      this.getArtworkByArtistTool.execute.bind(this.getArtworkByArtistTool),
    );
  }

  private setupRequestHandlers(): void {
    this.server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return await this.listResources.handle();
    });
    this.server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return await this.readResources.handle(request);
    });
  }

  private setupPrompts(): void {
    this.server.prompt(
      'art-gallery',
      'Generates an art gallery for a specific artist',
      {
        artist: z.string().describe('The name of the artist to generate a gallery for'),
      },
      async ({ artist }: { artist: string }) => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: getGalleryPrompt(artist),
              },
            },
          ],
        };
      },
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return ArticServer.serveSSE('/sse').fetch(request, env, ctx);
    }

    if (url.pathname === '/mcp') {
      return ArticServer.serve('/mcp').fetch(request, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },
};
