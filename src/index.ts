#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ListResources } from './handlers/ListResources';
import { ReadResources } from './handlers/ReadResources';
import { GetArtworkByIdTool } from './tools/GetArtworkByIdTool';
import { SearchByTitleTool } from './tools/SearchByTitleTool';

class ArticServer {
  private server: McpServer;
  private searchByTitleTool: SearchByTitleTool;
  private getArtworkByIdTool: GetArtworkByIdTool;
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
          tools: {},
          resources: {},
        },
      },
    );
    this.searchByTitleTool = new SearchByTitleTool();
    this.getArtworkByIdTool = new GetArtworkByIdTool(this.server);
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
