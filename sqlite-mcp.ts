import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as sqlite3 from 'sqlite3';
import { Database, RunResult } from 'sqlite3';

const server = new McpServer({
  name: "SQLite MCP",
  version: "1.0.0"
});

let db: Database | null = null;

// Initialize database connection
server.tool(
  "connect",
  { dbPath: z.string() },
  async ({ dbPath }) => {
    try {
      db = new sqlite3.Database(dbPath);
      return {
        content: [{ type: "text", text: "Connected to database successfully" }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error connecting to database: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

// Execute SQL query
server.tool(
  "query",
  { sql: z.string() },
  async ({ sql }) => {
    if (!db) {
      return {
        content: [{ type: "text", text: "Database not connected. Use connect tool first." }]
      };
    }

    try {
      return new Promise((resolve, reject) => {
        db!.all(sql, (err: Error | null, rows: any[]) => {
          if (err) {
            resolve({
              content: [{ type: "text", text: `Error executing query: ${err.message}` }]
            });
          } else {
            resolve({
              content: [{ type: "text", text: JSON.stringify(rows, null, 2) }]
            });
          }
        });
      });
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error executing query: ${error?.message || 'Unknown error'}` }]
      };
    }
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error); 