# 🕸️ Advanced Web Scraper

A highly adaptable and intelligent web scraping application built with Next.js, TypeScript, and Puppeteer. Extract any data from websites with natural language instructions and store results in a Neon PostgreSQL database.

## ✨ Features

- **🎯 Intelligent Data Extraction**: Use natural language to specify what data you want to extract
- **🕵️ Anti-Detection**: Built-in stealth mode with puppeteer-extra-plugin-stealth
- **💾 Data Persistence**: Store results in Neon serverless PostgreSQL database
- **📊 Real-time Progress**: Live scraping status with progress indicators
- **📚 History Management**: View and manage past scraping sessions
- **🎨 Modern UI**: Beautiful, responsive interface with Framer Motion animations
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🌙 Dark Mode**: Automatic dark/light theme support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database account

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Neon PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Scraping Configuration
SCRAPING_DELAY_MS=1000
MAX_SCRAPING_TIMEOUT=30000
```

3. **Start the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

