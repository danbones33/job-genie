# Job Genie

An AI-powered job search and analysis platform. Search listings across multiple boards, get deep-dive company analysis, skills matching, and resume suggestions — all in one place.

## Features

- **Smart Job Search** — Filter by keywords, location, industry, salary range, and work type (remote / hybrid / on-site)
- **Deep Dive Analysis** — Select any listing for AI-generated insights: company culture, employee reviews, salary benchmarks, market trends, skills gap assessment, and red flags
- **Resume Matching** — Upload your resume (PDF) and get personalized suggestions for each role
- **Save & Track** — Bookmark jobs and manage your pipeline

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Express / Node.js
- **AI Integration:** MCP (Model Context Protocol) servers for filesystem and database tooling

## Getting Started

```bash
# Install dependencies
npm install

# Start the backend
cd server && npm install && npm start

# Start the frontend (in project root)
npm run dev
```

The app runs at `http://localhost:5173` with the API server on port `3000`.

## Configuration

Copy `.env.example` in the `server/` directory and fill in your keys:

```bash
cp server/.env.example server/.env
```

## License

MIT
