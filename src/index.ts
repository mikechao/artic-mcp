#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ListResources } from './handlers/ListResources';
import { ReadResources } from './handlers/ReadResources';
import { ArtistSearchTool } from './tools/ArtistSearchTool';
import { ElasticSearchTool } from './tools/ElasticSearchTool';
import { FullTextSearchTool } from './tools/FullTextSearchTool';
import { GetArtworkByArtistTool } from './tools/GetArtworkByArtistTool';
import { GetArtworkByIdTool } from './tools/GetArtworkByIdTool';
import { SearchByTitleTool } from './tools/SearchByTitleTool';

class ArticServer {
  private server: McpServer;
  private searchByTitleTool: SearchByTitleTool;
  private getArtworkByIdTool: GetArtworkByIdTool;
  private fullTextSearchTool: FullTextSearchTool;
  private artistSearchTool: ArtistSearchTool;
  private getArtworkByArtistTool: GetArtworkByArtistTool;
  private elasticSearchTool: ElasticSearchTool;
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
          logging: {},
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
    this.elasticSearchTool = new ElasticSearchTool(this.server);
    this.listResources = new ListResources(this.getArtworkByIdTool);
    this.readResources = new ReadResources(this.getArtworkByIdTool);
    this.setupTools();
    this.setupRequestHandlers();
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
      this.elasticSearchTool.name,
      this.elasticSearchTool.description,
      this.elasticSearchTool.inputSchema.shape,
      this.elasticSearchTool.execute.bind(this.elasticSearchTool),
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
