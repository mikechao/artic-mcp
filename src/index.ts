#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import z from 'zod';
import { ListResources } from './handlers/ListResources';
import { ReadResources } from './handlers/ReadResources';
import { getGalleryPrompt } from './prompts/GalleryPrompt';
import { ArtistSearchTool } from './tools/ArtistSearchTool';
import { FullTextSearchTool } from './tools/FullTextSearchTool';
import { GetArtworkByArtistTool } from './tools/GetArtworkByArtistTool';
import { GetArtworkByIdTool } from './tools/GetArtworkByIdTool';
import { SearchByTitleTool } from './tools/SearchByTitleTool';
import { SearchByMediumTool } from './tools/SearchByMediumTool';

class ArticServer {
  private server: McpServer;
  private searchByTitleTool: SearchByTitleTool;
  private getArtworkByIdTool: GetArtworkByIdTool;
  private fullTextSearchTool: FullTextSearchTool;
  private artistSearchTool: ArtistSearchTool;
  private getArtworkByArtistTool: GetArtworkByArtistTool;
  private searchByMediumTool: SearchByMediumTool;
  private listResources: ListResources;
  private readResources: ReadResources;

  constructor() {
    this.server = new McpServer(
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
    this.searchByTitleTool = new SearchByTitleTool();
    this.getArtworkByIdTool = new GetArtworkByIdTool(this.server);
    this.fullTextSearchTool = new FullTextSearchTool();
    this.artistSearchTool = new ArtistSearchTool();
    this.getArtworkByArtistTool = new GetArtworkByArtistTool();
    this.searchByMediumTool = new SearchByMediumTool();
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
    this.server.tool(
      this.searchByMediumTool.name,
      this.searchByMediumTool.description,
      this.searchByMediumTool.inputSchema.shape,
      this.searchByMediumTool.execute.bind(this.searchByMediumTool),
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
      async ({ artist }) => {
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

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Art Institute of Chicago MCP server running on stdio');
  }
}

const server = new ArticServer();
server.start().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
