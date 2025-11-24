# Stream Deck Icon Pack Generator

A modern web application for generating complete, consistent icon packs for Stream Deck devices. Browse curated Stream Deck-focused icons or access full Iconify libraries, customize styling, and export professional icon packs with metadata.

## Features

- **Two Browsing Modes**: Recommended (curated icons) and Advanced (full Iconify libraries)
- **12 Icon Libraries**: Lucide, Material Symbols, Heroicons, Tabler, and more
- **Advanced Styling**: Colors, stroke width, background shapes, padding, effects
- **Real-time Preview**: See changes instantly with accurate rendering
- **Export System**: Generate ZIP files with PNG icons and Stream Deck metadata
- **Responsive Design**: Modern UI with dark theme and smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS 4
- **Components**: Radix UI via shadcn/ui
- **Icons**: Iconify API with local caching
- **Export**: Canvas API for PNG rendering, JSZip for packaging

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install && yarn dev
# or
pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
