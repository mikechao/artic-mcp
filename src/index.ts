#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GetArtworkByIdTool } from './tools/GetArtworkByIdTool';
import { SearchByTitleTool } from './tools/SearchByTitleTool';

class ArticServer {
  private server: McpServer;
  private searchByTitleTool: SearchByTitleTool;
  private getArtworkByIdTool: GetArtworkByIdTool;

  constructor() {
    this.server = new McpServer(
      {
        name: 'artic-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
    this.searchByTitleTool = new SearchByTitleTool();
    this.getArtworkByIdTool = new GetArtworkByIdTool();
    this.setupTools();
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
