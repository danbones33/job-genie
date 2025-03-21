# MCP Servers

This repository contains implementations of Model Context Protocol (MCP) servers for various functionalities:

## Available Servers

### 1. Filesystem MCP Server
Provides tools for interacting with the filesystem:
- `readFile`: Read contents of a file
- `listDirectory`: List contents of a directory
- `writeFile`: Write content to a file

### 2. SQLite MCP Server
Provides tools for working with SQLite databases:
- `connect`: Connect to a SQLite database
- `query`: Execute SQL queries

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

Start the servers individually:

```bash
# Start Filesystem MCP Server
npm run start:fs

# Start SQLite MCP Server
npm run start:sqlite
```

## Development

The project uses TypeScript and follows the Model Context Protocol specification. To develop:

1. Install dependencies: `npm install`
2. Make changes to the TypeScript files in the root directory
3. Build: `npm run build`
4. Test your changes

## Requirements

- Node.js >= 16
- npm >= 7

## License

Private repository - All rights reserved
