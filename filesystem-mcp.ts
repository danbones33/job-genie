import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

const server = new McpServer({
  name: "Filesystem MCP",
  version: "1.0.0"
});

// Read file contents
server.tool(
  "readFile",
  { filePath: z.string() },
  async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error reading file: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

// List directory contents
server.tool(
  "listDirectory",
  { dirPath: z.string() },
  async ({ dirPath }) => {
    try {
      const files = await fs.readdir(dirPath);
      return {
        content: [{ type: "text", text: JSON.stringify(files, null, 2) }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing directory: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

// Write file
server.tool(
  "writeFile",
  { 
    filePath: z.string(),
    content: z.string()
  },
  async ({ filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return {
        content: [{ type: "text", text: `File written successfully: ${filePath}` }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error writing file: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error); 